import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Brain,
  MapPin,
  Navigation,
  Pill,
  Radar as RadarIcon,
  RefreshCw,
  Ruler,
  Sparkles,
  Target,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import { differenceInDays, format, formatDistanceToNow, isSameDay, isWithinInterval, subDays } from 'date-fns';
import { MobileLayout, PageContent } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PetAvatar } from '@/components/common/PetAvatar';
import { PetSelector } from '@/components/common/PetSelector';
import { DateSelector } from '@/components/common/DateSelector';
import { useApp } from '@/contexts/AppContext';
import {
  useFoodLogs,
  useMeasurementLogs,
  usePoopLogs,
  useSupplementLogs,
} from '@/hooks/useLogs';
import { useHealthNotes } from '@/hooks/useHealthNotes';
import { formatPetAgeShort } from '@/lib/petAge';
import { Button } from '@/components/ui/button';
import { EmptyStateCard } from '@/components/common/SummaryCard';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { SummaryCard } from '@/components/common/SummaryCard';
import { usePetInsights, BreedBreakdownResponse, ChatMessage } from '@/hooks/usePetInsights';
import { cn } from '@/lib/utils';
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useNearbyVets } from '@/hooks/useNearbyVets';
import { useRewards } from '@/hooks/useRewards';
import { useVetChat } from '@/hooks/useVetChat';
import { toast } from '@/hooks/use-toast';

type Timeframe = 'daily' | 'monthly';

const clampScore = (value: number) => Math.max(10, Math.min(100, Math.round(value || 0)));

function useIsDarkMode() {
  const getDark = () =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getDark());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => setIsDarkMode(getDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDarkMode;
}

export default function AIAnalytics() {
  const navigate = useNavigate();
  const {
    pets,
    petsLoading,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    selectedDate,
    setSelectedDate,
  } = useApp();

  const { logs: foodLogs } = useFoodLogs(selectedPetId);
  const { logs: poopLogs } = usePoopLogs(selectedPetId);
  const { logs: supplementLogs } = useSupplementLogs(selectedPetId);
  const { logs: measurementLogs } = useMeasurementLogs(selectedPetId);
  const { notes: healthNotes, refresh: refreshHealthNotes } = useHealthNotes(selectedPetId);
  const { triggerAnalysis, fetchBreedBreakdown, sendChatMessage, isAnalyzing, isFetchingBreed, isChatting } = usePetInsights();
  const { metrics: rewardMetrics } = useRewards();
  const { vets, coords, locationError, isLocating, requestLocation, hasRequested } = useNearbyVets();
  const {
    activeThread: vetThread,
    messages: vetMessages,
    startThread: openVetThread,
    sendMessage: sendVetMessage,
    isStarting: isOpeningVetThread,
    isSending: isSendingVetMessage,
  } = useVetChat(selectedPetId);
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [chatMode, setChatMode] = useState<'ai' | 'vet'>('ai');
  const [chatDraft, setChatDraft] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [vetMessageDraft, setVetMessageDraft] = useState('');
  const [vetIntroNotes, setVetIntroNotes] = useState('');
  const breedCacheRef = useRef<Record<string, BreedBreakdownResponse>>({});
  const [, setBreedInsightVersion] = useState(0);
  const isDarkMode = useIsDarkMode();
  const chartPalette = useMemo(
    () => ({
      text: isDarkMode ? 'rgba(248,249,251,0.85)' : 'rgba(34,34,34,0.8)',
      grid: isDarkMode ? 'rgba(248,249,251,0.15)' : 'rgba(0,0,0,0.08)',
      line: isDarkMode ? '#F4D7C4' : 'hsl(22, 24%, 21%)',
      accent: isDarkMode ? '#7DD3FC' : '#0F172A',
      areaTop: isDarkMode ? 'rgba(244,215,196,0.45)' : 'rgba(244,215,196,0.4)',
      areaBottom: isDarkMode ? 'rgba(244,215,196,0.05)' : 'rgba(244,215,196,0)',
    }),
    [isDarkMode]
  );

  const latestNote = healthNotes[0];

  const monthRange = useMemo(() => {
    const end = selectedDate;
    const start = subDays(end, 29);
    return { start, end };
  }, [selectedDate]);

  const dailyFoodLogs = useMemo(
    () => foodLogs.filter((log) => isSameDay(new Date(log.timestamp), selectedDate)),
    [foodLogs, selectedDate]
  );
  const dailyPoopLogs = useMemo(
    () => poopLogs.filter((log) => isSameDay(new Date(log.timestamp), selectedDate)),
    [poopLogs, selectedDate]
  );
  const dailySupplementLogs = useMemo(
    () => supplementLogs.filter((log) => isSameDay(new Date(log.timestamp), selectedDate)),
    [supplementLogs, selectedDate]
  );

  const monthlyFoodLogs = useMemo(
    () => foodLogs.filter((log) => isWithinInterval(new Date(log.timestamp), monthRange)),
    [foodLogs, monthRange]
  );
  const monthlyPoopLogs = useMemo(
    () => poopLogs.filter((log) => isWithinInterval(new Date(log.timestamp), monthRange)),
    [poopLogs, monthRange]
  );
  const monthlySupplementLogs = useMemo(
    () => supplementLogs.filter((log) => isWithinInterval(new Date(log.timestamp), monthRange)),
    [supplementLogs, monthRange]
  );

  const viewFoodLogs = timeframe === 'daily' ? dailyFoodLogs : monthlyFoodLogs;
  const viewPoopLogs = timeframe === 'daily' ? dailyPoopLogs : monthlyPoopLogs;
  const viewSupplementLogs = timeframe === 'daily' ? dailySupplementLogs : monthlySupplementLogs;
  const rangeDays =
    timeframe === 'daily'
      ? 1
      : Math.max(1, differenceInDays(monthRange.end, monthRange.start) + 1);

  const totalFoodGrams = dailyFoodLogs.reduce((acc, log) => acc + log.amountGrams, 0);

  const lastWeight = measurementLogs.length > 0 ? measurementLogs[0].weightKg : null;
  const prevWeight = measurementLogs.length > 1 ? measurementLogs[1].weightKg : null;
  const weightDelta =
    lastWeight && prevWeight ? Number((lastWeight - prevWeight).toFixed(1)) : null;

  const weightChartData = useMemo(() => {
    return measurementLogs
      .filter((log) => log.weightKg)
      .slice(0, 10)
      .reverse()
      .map((log) => ({
        date: format(new Date(log.timestamp), 'MMM d'),
        weight: log.weightKg,
      }));
  }, [measurementLogs]);

  const growthSeries = useMemo(() => {
    return measurementLogs
      .filter((log) => log.weightKg || log.chestCm || log.bodyLengthCm)
      .slice(0, 8)
      .reverse()
      .map((log) => ({
        date: format(new Date(log.timestamp), 'MMM d'),
        weight: log.weightKg ?? null,
        girth: log.chestCm ?? null,
      }));
  }, [measurementLogs]);

  const macroAverages = useMemo(() => {
    if (!viewFoodLogs.length) return null;
    const totals = viewFoodLogs.reduce(
      (acc, log) => {
        return {
          protein: acc.protein + (log.proteinPercent ?? 0),
          fat: acc.fat + (log.fatPercent ?? 0),
          carb: acc.carb + (log.carbPercent ?? 0),
          count:
            acc.count +
            (log.proteinPercent || log.fatPercent || log.carbPercent ? 1 : 0),
        };
      },
      { protein: 0, fat: 0, carb: 0, count: 0 }
    );
    if (totals.count === 0) return null;
    return {
      protein: Math.round(totals.protein / totals.count),
      fat: Math.round(totals.fat / totals.count),
      carb: Math.round(totals.carb / totals.count),
    };
  }, [viewFoodLogs]);

  const mealScore = clampScore((viewFoodLogs.length / rangeDays / 3) * 100);
  const digestionPenalty = (viewPoopLogs || []).reduce((penalty, log) => {
    if (!log) return penalty;
    if (log.color === 'black' || log.color === 'red') return penalty + 30;
    if (log.consistency === 'diarrhea' || log.consistency === 'soft') return penalty + 20;
    if (log.consistency === 'hard') return penalty + 10;
    return penalty;
  }, 0);
  const digestionScore = clampScore(
    viewPoopLogs.length === 0 ? 55 : 95 - digestionPenalty
  );
  const supplementScore = clampScore((viewSupplementLogs.length / rangeDays) * 120);
  const moodScore = clampScore(
    latestNote
      ? latestNote.riskLevel === 'see_vet'
        ? 35
        : latestNote.riskLevel === 'watch'
          ? 65
          : 95
      : 60
  );
  const growthRaw =
    measurementLogs.length < 2 ||
    !measurementLogs[0].weightKg ||
    !measurementLogs[1].weightKg
      ? 70
      : 100 - Math.abs(measurementLogs[0].weightKg! - measurementLogs[1].weightKg!) * 25;
  const growthScore = clampScore(growthRaw);

  const wellnessRadarData = [
    { metric: 'Nutrition', score: mealScore },
    { metric: 'Digestion', score: digestionScore },
    { metric: 'Supplements', score: supplementScore },
    { metric: 'Mood', score: moodScore },
    { metric: 'Growth', score: growthScore },
  ];

  const breedInsight = selectedPetId ? breedCacheRef.current[selectedPetId] ?? null : null;
  const stoolHighlight = viewPoopLogs[0]
    ? `${viewPoopLogs[0].color.replace('_', ' ')} • ${viewPoopLogs[0].consistency}`
    : 'No stool data logged yet';

  useEffect(() => {
    if (!selectedPetId || !selectedPet?.name) {
      setChatHistory([
        { role: 'assistant', content: 'Select a pet to start an AI conversation about their care.' },
      ]);
      return;
    }
    setChatHistory([
      {
        role: 'assistant',
        content: `Hi! I'm watching ${selectedPet.name}'s meals, poop colours, and supplements. Ask anything or request a plan.`,
      },
    ]);
  }, [selectedPetId, selectedPet?.name]);

  useEffect(() => {
    if (!selectedPetId) return;
    if (breedCacheRef.current[selectedPetId]) return;
    let cancelled = false;
    (async () => {
      const payload = await fetchBreedBreakdown(selectedPetId);
      if (!cancelled && payload) {
        breedCacheRef.current[selectedPetId] = payload;
        setBreedInsightVersion((v) => v + 1);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPetId, fetchBreedBreakdown]);

  const handleInsightRefresh = async () => {
    if (!selectedPetId) {
      toast({
        title: 'Select a pet first',
        description: 'Pick a pet to analyze their latest activity.',
      });
      return;
    }
    const result = await triggerAnalysis(selectedPetId);
    if (result) {
      refreshHealthNotes();
    }
  };

  const handleBreedRefresh = async () => {
    if (!selectedPetId) return;
    const payload = await fetchBreedBreakdown(selectedPetId);
    if (payload) {
      breedCacheRef.current[selectedPetId] = payload;
      setBreedInsightVersion((v) => v + 1);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPetId || !chatDraft.trim()) return;
    const userMessage: ChatMessage = { role: 'user', content: chatDraft.trim() };
    const previewHistory = [...chatHistory, userMessage];
    setChatHistory(previewHistory);
    setChatDraft('');
    const response = await sendChatMessage(selectedPetId, previewHistory);
    if (response?.reply) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    }
  };

  const handleVetThreadStart = async () => {
    if (!selectedPetId) {
      toast({
        title: 'Select a pet first',
        description: 'Real vets need to know which pet to review.',
        variant: 'destructive',
      });
      return;
    }
    if (!vetIntroNotes.trim()) {
      toast({
        title: 'Describe the issue',
        description: 'Share a quick summary so the vet can jump in.',
      });
      return;
    }
    try {
      await openVetThread({
        petId: selectedPetId,
        topic: `${selectedPet?.name ?? 'Pet'} consult`,
        initialMessage: vetIntroNotes.trim(),
        creditCost: 25,
      });
      setVetIntroNotes('');
      setChatMode('vet');
      toast({
        title: 'Vet chat opened',
        description: '25 credits deducted. Expect a vet shortly.',
      });
    } catch (error: any) {
      toast({
        title: 'Unable to start chat',
        description: error.message || 'Check your credit balance.',
        variant: 'destructive',
      });
    }
  };

  const handleVetMessageSend = async () => {
    if (!vetMessageDraft.trim()) return;
    try {
      await sendVetMessage({ message: vetMessageDraft.trim() });
      setVetMessageDraft('');
    } catch (error: any) {
      toast({
        title: 'Message failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (petsLoading) {
    return (
      <MobileLayout>
        <PageContent className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">Loading…</div>
        </PageContent>
        <BottomNav />
      </MobileLayout>
    );
  }

  if (!selectedPet || pets.length === 0) {
    return (
      <MobileLayout>
        <PageContent className="flex items-center justify-center min-h-screen">
          <EmptyStateCard
            icon={UtensilsCrossed}
            title="No pet yet"
            description="Add your first pet to unlock analytics"
            action={
              <Button onClick={() => navigate('/onboarding')}>
                Add Pet
              </Button>
            }
          />
        </PageContent>
        <BottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">AI analytics</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-semibold">{selectedPet.name}</h1>
              {selectedPet.dateOfBirth && (
                <span className="text-sm text-muted-foreground">
                  ({formatPetAgeShort(selectedPet.dateOfBirth)})
                </span>
              )}
            </div>
            {selectedPet.breed && (
              <p className="text-xs text-muted-foreground">
                {selectedPet.breed} • {selectedPet.species}
              </p>
            )}
          </div>
          <PetAvatar
            photoUrl={selectedPet.photoUrl}
            name={selectedPet.name}
            size="md"
          />
        </div>
      </header>

      <PageContent className="space-y-6 pb-24">
        <PetSelector
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
        />

        <div className="space-y-4">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Timeframe</p>
              <p className="text-sm text-muted-foreground">Switch between today and rolling 30 days</p>
            </div>
            <div className="inline-flex rounded-full bg-card-muted/70 p-1">
              {(['daily', 'monthly'] as Timeframe[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setTimeframe(option)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-all',
                    timeframe === option ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  {option === 'daily' ? 'Daily' : '30 day'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={UtensilsCrossed}
            title="Food"
            value={totalFoodGrams > 0 ? `${Math.round(totalFoodGrams)}g` : '—'}
            subtitle={`${dailyFoodLogs.length || 'No'} meals logged today`}
          />
          <SummaryCard
            icon={Target}
            title="Poop"
            value={dailyPoopLogs.length > 0 ? dailyPoopLogs.length.toString() : '—'}
            subtitle={dailyPoopLogs.length > 0 ? stoolHighlight : 'No entries yet'}
          />
          <SummaryCard
            icon={Pill}
            title="Supplements"
            value={dailySupplementLogs.length > 0 ? dailySupplementLogs.length.toString() : '—'}
            subtitle={dailySupplementLogs.length > 0 ? 'Given today' : 'None given'}
          />
          <SummaryCard
            icon={Ruler}
            title="Weight"
            value={lastWeight ? `${lastWeight}kg` : '—'}
            subtitle={
              weightDelta !== null
                ? `${weightDelta >= 0 ? '+' : ''}${weightDelta}kg vs last`
                : 'Latest reading'
            }
          />
        </div>

        <div className="card-nude space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> MCP Health Insight
              </p>
              <h3 className="font-display font-medium">Automatic triage</h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleInsightRefresh}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              {isAnalyzing ? 'Analyzing...' : 'Refresh'}
            </Button>
          </div>
          {latestNote ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="text-xs font-medium">{latestNote.riskLevel ?? 'normal'}</Badge>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(latestNote.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="font-medium leading-snug">{latestNote.summary}</p>
              {latestNote.recommendations && (
                <p className="text-sm text-muted-foreground">{latestNote.recommendations}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No AI notes yet. Log activity and tap refresh.</p>
          )}
        </div>

        {macroAverages && (
          <div className="card-nude p-4">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              <Activity className="w-3 h-3" />
              Auto macro mix
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Object.entries(macroAverages).map(([macro, value]) => (
                <div key={macro} className="rounded-xl bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground uppercase">{macro}</p>
                  <p className="text-lg font-display font-semibold">{value}%</p>
                  <p className="text-[11px] text-muted-foreground">avg per meal</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-nude space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <RadarIcon className="w-3 h-3" /> Wellness radar
              </p>
              <h3 className="font-display font-medium">AI health pulses</h3>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={wellnessRadarData}>
                <PolarGrid stroke={chartPalette.grid} />
                <PolarAngleAxis dataKey="metric" stroke={chartPalette.text} />
                <PolarRadiusAxis angle={45} domain={[0, 100]} tick={false} />
                <Radar
                  dataKey="score"
                  stroke={chartPalette.line}
                  fill={chartPalette.areaTop}
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <p>Daily meals average {(viewFoodLogs.length / rangeDays).toFixed(1)}. Keep it consistent to stay above 80% nutrition score.</p>
            <p>
              {viewPoopLogs.length > 0
                ? `Latest stool is ${viewPoopLogs[0].consistency}. ${viewPoopLogs[0].bloodPresent ? 'Blood detected — monitor closely.' : 'Looks steady.'}`
                : 'Log stool entries so AI can watch digestion trends.'}
            </p>
          </div>
        </div>

        <div className="card-nude space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth charts
            </h3>
            <span className="text-xs text-muted-foreground">
              {weightChartData.length > 0 ? `${weightChartData.length} data points` : 'No data yet'}
            </span>
          </div>
          {weightChartData.length > 0 ? (
            <div className="space-y-6">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightChartData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartPalette.areaTop} />
                        <stop offset="100%" stopColor={chartPalette.areaBottom} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: chartPalette.text }}
                    />
                    <YAxis
                      domain={['dataMin - 0.2', 'dataMax + 0.2']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: chartPalette.text }}
                      width={30}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke={chartPalette.line}
                      strokeWidth={2}
                      fill="url(#weightGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {growthSeries.length > 0 && (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthSeries}>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: chartPalette.text }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={30}
                        tick={{ fontSize: 10, fill: chartPalette.text }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={chartPalette.accent}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No measurement data yet
            </p>
          )}
        </div>

        <div className="card-nude space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Brain className="w-3 h-3" /> Breed DNA lab
              </p>
              <h3 className="font-display font-medium">Photo + metadata analysis</h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBreedRefresh}
              disabled={isFetchingBreed}
              className="gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              {isFetchingBreed ? 'Refreshing…' : 'Re-run'}
            </Button>
          </div>
          {breedInsight ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {breedInsight.breakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-card-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    {item.traits && (
                      <p className="text-xs text-muted-foreground mt-1">{item.traits}</p>
                    )}
                  </div>
                ))}
              </div>
              {breedInsight.originStory && (
                <div className="rounded-xl bg-background/70 p-3 text-sm">
                  {breedInsight.originStory}
                </div>
              )}
              {breedInsight.watchouts && breedInsight.watchouts.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-2">Watch outs</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {breedInsight.watchouts.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Upload a photo during onboarding so AI can estimate their mix.
            </p>
          )}
        </div>

        <div className="card-nude space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-medium flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Care exchange
              </h3>
              <p className="text-xs text-muted-foreground">
                Balance: {rewardMetrics?.credits ?? 0} credits
              </p>
            </div>
            <div className="inline-flex rounded-full bg-card-muted/60 p-1">
              <button
                onClick={() => setChatMode('ai')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full',
                  chatMode === 'ai' ? 'bg-foreground text-background' : 'text-muted-foreground'
                )}
              >
                AI
              </button>
              <button
                onClick={() => setChatMode('vet')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full',
                  chatMode === 'vet' ? 'bg-foreground text-background' : 'text-muted-foreground'
                )}
              >
                Real vet
              </button>
            </div>
          </div>

          {chatMode === 'ai' ? (
            <>
              <div className="space-y-3 max-h-60 overflow-auto pr-2">
                {chatHistory.map((message, idx) => (
                  <div
                    key={`${message.role}-${idx}`}
                    className={cn(
                      'rounded-2xl px-3 py-2 text-sm',
                      message.role === 'assistant'
                        ? 'bg-background/80 text-foreground'
                        : 'bg-primary text-primary-foreground self-end ml-auto'
                    )}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Textarea
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder="Ask about stool changes, meal plans, or mood..."
                  rows={2}
                />
                <Button onClick={handleSendMessage} disabled={!chatDraft.trim() || isChatting}>
                  {isChatting ? 'Thinking…' : 'Send to AI'}
                </Button>
              </div>
            </>
          ) : vetThread ? (
            <>
              <div className="rounded-xl bg-background/70 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{vetThread.topic || 'Vet consult in progress'}</p>
                  <p className="text-xs text-muted-foreground">
                    Last update{' '}
                    {vetThread.lastMessageAt
                      ? formatDistanceToNow(new Date(vetThread.lastMessageAt), { addSuffix: true })
                      : 'pending'}
                  </p>
                </div>
                <Badge variant="outline">{vetThread.status}</Badge>
              </div>
              <div className="max-h-56 overflow-auto space-y-2 pr-1">
                {vetMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'rounded-2xl px-3 py-2 text-sm',
                      message.senderType === 'vet'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background/80'
                    )}
                  >
                    {message.message}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
                {vetMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Waiting for your first update. Share how your pet is doing.
                  </p>
                )}
              </div>
              <Textarea
                value={vetMessageDraft}
                onChange={(e) => setVetMessageDraft(e.target.value)}
                placeholder="Update your vet with new symptoms or progress"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleVetMessageSend}
                  disabled={!vetMessageDraft.trim() || isSendingVetMessage}
                  className="flex-1"
                >
                  {isSendingVetMessage ? 'Sending…' : 'Send to vet'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/care')}>
                  Open hub
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Need a human opinion? Spend 25 credits to chat with a licensed vet.
              </p>
              <Textarea
                value={vetIntroNotes}
                onChange={(e) => setVetIntroNotes(e.target.value)}
                placeholder="Describe the concern so a vet can respond"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleVetThreadStart}
                  disabled={isOpeningVetThread}
                  className="flex-1"
                >
                  {isOpeningVetThread ? 'Connecting…' : 'Connect with vet (25 credits)'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/care')}>
                  Learn more
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="card-nude space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nearby vets
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={requestLocation}
              disabled={isLocating}
            >
              {isLocating ? 'Locating…' : coords ? 'Refresh' : 'Detect location'}
            </Button>
          </div>
          {hasRequested && locationError && (
            <p className="text-sm text-destructive">{locationError}</p>
          )}
          {vets.length > 0 ? (
            <div className="space-y-3">
              {vets.map((vet) => (
                <div key={vet.id} className="p-3 rounded-xl bg-background/80 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-card-muted flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{vet.name}</p>
                    <p className="text-xs text-muted-foreground">{vet.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vet.distanceKm} km away
                    </p>
                  </div>
                  <a
                    href={vet.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-primary"
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {hasRequested
                ? 'No clinics detected nearby yet. Try refreshing or widen your search radius.'
                : 'Allow location so we can map the closest vets for emergencies.'}
            </p>
          )}
        </div>
      </PageContent>

      <BottomNav />
    </MobileLayout>
  );
}
