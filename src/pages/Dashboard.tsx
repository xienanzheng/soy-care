import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSameDay, format, differenceInCalendarDays, subDays } from 'date-fns';
import { Settings, UtensilsCrossed, Target, Pill, Ruler } from 'lucide-react';
import { MobileLayout, PageContent } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { FAB } from '@/components/common/FAB';
import { PetAvatar } from '@/components/common/PetAvatar';
import { PetSelector } from '@/components/common/PetSelector';
import { DateSelector } from '@/components/common/DateSelector';
import { SummaryCard, EmptyStateCard } from '@/components/common/SummaryCard';
import { Button } from '@/components/ui/button';
import { formatPetAgeShort } from '@/lib/petAge';
import { useApp } from '@/contexts/AppContext';
import { useFoodLogs, useMeasurementLogs, usePoopLogs, useSupplementLogs } from '@/hooks/useLogs';
import { useChallenges } from '@/hooks/useChallenges';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';

export default function Dashboard() {
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
  const { challenges } = useChallenges(selectedPetId);
  const { posts: communityPosts } = useCommunityFeed();

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

  const totalFoodGrams = dailyFoodLogs.reduce((acc, log) => acc + log.amountGrams, 0);
  const lastWeight = measurementLogs.length > 0 ? measurementLogs[0].weightKg : null;

  const spotlightPost = communityPosts[0];
  const statusStyles = {
    ok: { label: 'On track', color: 'bg-emerald-500' },
    watch: { label: 'Watch', color: 'bg-amber-400' },
    alert: { label: 'Alert', color: 'bg-rose-500' },
  };

  const poopTrend = useMemo(() => {
    const now = selectedDate;
    const sevenDayLogs = poopLogs.filter(
      (log) => differenceInCalendarDays(now, new Date(log.timestamp)) <= 7
    );

    const hasUrgentLook = sevenDayLogs.some(
      (log) =>
        log.bloodPresent ||
        log.color === 'black' ||
        log.color === 'red' ||
        (log.undesirableBehaviors && log.undesirableBehaviors.length > 0 && !log.undesirableBehaviors.includes('not_applicable'))
    );
    const hasWatchLook =
      !hasUrgentLook &&
      sevenDayLogs.some(
        (log) =>
          log.consistency === 'diarrhea' ||
          log.mucusPresent ||
          ['green', 'yellow', 'orange', 'white', 'grey', 'clay'].includes(log.color)
      );

    const lookStatus: 'ok' | 'watch' | 'alert' = hasUrgentLook ? 'alert' : hasWatchLook ? 'watch' : 'ok';
    const lookMessage =
      lookStatus === 'alert'
        ? 'Recent stool logs contain high-risk markers (blood, tarry, or multiple undesirable behaviors).'
        : lookStatus === 'watch'
        ? 'Some logs show softer texture or unusual colors. Keep monitoring hydration and diet.'
        : 'Looks steady—recent entries stay within healthy color and texture ranges.';

    const freqSegments = Array.from({ length: 3 }).map((_, idx) => {
      const day = subDays(now, idx);
      const count = poopLogs.filter((log) => isSameDay(new Date(log.timestamp), day)).length;
      let status: 'ok' | 'watch' | 'alert' = 'ok';
      if (count === 0 || count > 3) {
        status = count === 0 ? 'alert' : 'watch';
      }
      return {
        label: format(day, 'EEE'),
        count,
        status,
      };
    });

    const avg =
      freqSegments.reduce((sum, seg) => sum + seg.count, 0) / (freqSegments.length || 1);
    const freqStatus: 'ok' | 'watch' | 'alert' =
      freqSegments.some((seg) => seg.status === 'alert')
        ? 'alert'
        : freqSegments.some((seg) => seg.status === 'watch')
        ? 'watch'
        : 'ok';
    const freqMessage =
      freqStatus === 'alert'
        ? 'Log consistency suggests very low or no bowel movements. Check hydration and fiber.'
        : freqStatus === 'watch'
        ? 'Stool frequency hit the edges of the 1–3 logs/day range. Keep an eye on routines.'
        : 'Average stool frequency is within the target 1–3 per day.';

    return { lookStatus, lookMessage, freqStatus, freqMessage, freqSegments, avg };
  }, [poopLogs, selectedDate]);

  if (petsLoading) {
    return (
      <MobileLayout>
        <PageContent className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
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
            description="Add your first pet to get started"
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello!</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-semibold">{selectedPet.name}</h1>
              {selectedPet.dateOfBirth && (
                <span className="text-sm text-muted-foreground">
                  ({formatPetAgeShort(selectedPet.dateOfBirth)})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PetAvatar
              photoUrl={selectedPet.photoUrl}
              name={selectedPet.name}
              size="md"
            />
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl hover:bg-card-muted transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <PageContent className="space-y-6">
        <PetSelector
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
        />

        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={UtensilsCrossed}
            title="Food"
            value={totalFoodGrams > 0 ? `${totalFoodGrams}g` : '—'}
            subtitle={dailyFoodLogs.length > 0 ? `${dailyFoodLogs.length} meals` : 'No meals today'}
            onClick={() => navigate('/add-food')}
          />
          <SummaryCard
            icon={Target}
            title="Poop"
            value={dailyPoopLogs.length > 0 ? dailyPoopLogs.length.toString() : '—'}
            subtitle={dailyPoopLogs.length > 0 ? 'entries today' : 'No entries'}
            onClick={() => navigate('/add-poop')}
          />
          <SummaryCard
            icon={Pill}
            title="Supplements"
            value={dailySupplementLogs.length > 0 ? dailySupplementLogs.length.toString() : '—'}
            subtitle={dailySupplementLogs.length > 0 ? 'given today' : 'None given'}
            onClick={() => navigate('/add-supplement')}
          />
          <SummaryCard
            icon={Ruler}
            title="Weight"
            value={lastWeight ? `${lastWeight}kg` : '—'}
            subtitle={lastWeight ? 'Latest' : 'Not recorded'}
            onClick={() => navigate('/add-measurement')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/pets')}
            className="rounded-2xl bg-soycraft-cream text-soycraft-brown p-4 text-left shadow-soft transition hover:shadow-card"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">My pets</p>
            <p className="text-lg font-display">Manage &amp; add</p>
            <p className="text-xs text-muted-foreground mt-1">Update profiles or add a new buddy.</p>
          </button>
          <button
            onClick={() => navigate('/community')}
            className="rounded-full aspect-square bg-accent-pink/50 flex flex-col items-center justify-center text-center text-sm font-medium text-foreground shadow-soft mx-auto w-full max-w-[160px]"
          >
            <span className="text-xs uppercase text-muted-foreground">Community</span>
            <span className="text-lg font-display">Open feed</span>
          </button>
        </div>

        {poopLogs.length > 0 && (
          <div className="card-nude space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-medium">Poop trend alerts</h3>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Looks</span>
                <span className="font-semibold text-foreground">
                  {statusStyles[poopTrend.lookStatus].label}
                </span>
              </div>
              <div className="h-2 rounded-full bg-card-muted overflow-hidden mt-2">
                <div className={`h-full ${statusStyles[poopTrend.lookStatus].color}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{poopTrend.lookMessage}</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Frequency</span>
                <span className="font-semibold text-foreground">
                  {statusStyles[poopTrend.freqStatus].label} • {poopTrend.avg.toFixed(1)} avg/day
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {poopTrend.freqSegments.map((segment) => (
                  <div key={segment.label} className="text-center">
                    <div className="h-2 rounded-full bg-card-muted overflow-hidden">
                      <div className={`h-full ${statusStyles[segment.status].color}`} />
                    </div>
                    <p className="text-[10px] uppercase mt-1 text-muted-foreground">{segment.label}</p>
                    <p className="text-xs font-medium">{segment.count}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{poopTrend.freqMessage}</p>
            </div>
          </div>
        )}

        {challenges.length > 0 && (
          <div className="card-nude">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-medium">Care challenges</h3>
              <span className="text-xs text-muted-foreground">Build streaks to keep habits</span>
            </div>
            <div className="space-y-3">
              {challenges.slice(0, 2).map((challenge) => {
                const pct = Math.min(100, Math.round((challenge.progress / challenge.goal) * 100));
                return (
                  <div key={challenge.id} className="p-3 rounded-xl bg-background/60">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{challenge.title}</p>
                      {challenge.streakDays && (
                        <span className="text-xs text-muted-foreground">{challenge.streakDays} day streak</span>
                      )}
                    </div>
                    {challenge.subtitle && (
                      <p className="text-xs text-muted-foreground mb-1">{challenge.subtitle}</p>
                    )}
                    <div className="w-full h-2 rounded-full bg-card-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {spotlightPost && (
          <div className="card-nude space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-medium">Community spotlight</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
                Open feed
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {spotlightPost.ownerName} shared:
            </p>
            <p className="text-sm">{spotlightPost.content}</p>
            {spotlightPost.photoUrl && (
              <img
                src={spotlightPost.photoUrl}
                alt="Community post"
                className="w-full h-40 object-cover rounded-xl"
              />
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(spotlightPost.createdAt), 'MMM d, h:mm a')} • {spotlightPost.likes ?? 0} cheers
            </p>
          </div>
        )}

        <div>
          <h3 className="font-display font-medium mb-4">
            {format(selectedDate, 'EEEE, MMM d') === format(new Date(), 'EEEE, MMM d') 
              ? "Today's Activity" 
              : format(selectedDate, 'EEEE, MMM d')}
          </h3>
          
          {dailyFoodLogs.length === 0 && dailyPoopLogs.length === 0 && dailySupplementLogs.length === 0 ? (
            <EmptyStateCard
              icon={UtensilsCrossed}
              title="No activity yet"
              description="Start logging your pet's activities using the + button"
            />
          ) : (
            <div className="space-y-3">
              {[
                ...dailyFoodLogs.map(log => ({ ...log, type: 'food' as const })),
                ...dailyPoopLogs.map(log => ({ ...log, type: 'poop' as const })),
                ...dailySupplementLogs.map(log => ({ ...log, type: 'supplement' as const })),
              ]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((log) => {
                  if (log.type === 'food') {
                    return (
                      <div key={`food-${log.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.foodName}</p>
                          <p className="text-sm text-muted-foreground">{log.amountGrams}g • {log.mealType}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </span>
                      </div>
                    );
                  }
                  if (log.type === 'poop') {
                    return (
                      <div key={`poop-${log.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-accent-pink/30">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Poop</p>
                          <p className="text-sm text-muted-foreground">{log.consistency} • {log.amount}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={`supp-${log.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.supplementName}</p>
                        <p className="text-sm text-muted-foreground">{log.dosage}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </PageContent>

      <FAB />
      <BottomNav />
    </MobileLayout>
  );
}
