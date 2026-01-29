import { useState, useMemo, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { UtensilsCrossed, Target, Pill, Ruler, TrendingUp, Star, X } from 'lucide-react';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PetSelector } from '@/components/common/PetSelector';
import { LogItem } from '@/components/common/LogItem';
import { RatingSlider } from '@/components/common/RatingSlider';
import { useApp } from '@/contexts/AppContext';
import { useFoodLogs, usePoopLogs, useSupplementLogs, useMeasurementLogs } from '@/hooks/useLogs';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FoodLog, PoopLog, SupplementLog, MeasurementLog } from '@/types/pet';

type TabType = 'timeline' | 'charts';
type FilterType = 'all' | 'food' | 'poop' | 'supplement' | 'measurement';
type EditingLog = { type: 'food'; log: FoodLog } | { type: 'poop'; log: PoopLog } | { type: 'supplement'; log: SupplementLog } | { type: 'measurement'; log: MeasurementLog } | null;

export default function History() {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingLog, setEditingLog] = useState<EditingLog>(null);
  const { pets, selectedPet, selectedPetId, setSelectedPetId } = useApp();
  
  const { logs: foodLogs, deleteLog: deleteFoodLog, updateLog: updateFoodLog, isDeleting: isDeletingFood, isUpdating: isUpdatingFood } = useFoodLogs(selectedPetId);
  const { logs: poopLogs, deleteLog: deletePoopLog, updateLog: updatePoopLog, isDeleting: isDeletingPoop, isUpdating: isUpdatingPoop } = usePoopLogs(selectedPetId);
  const { logs: supplementLogs, deleteLog: deleteSupplementLog, updateLog: updateSupplementLog, isDeleting: isDeletingSupp, isUpdating: isUpdatingSupp } = useSupplementLogs(selectedPetId);
  const { logs: measurementLogs, deleteLog: deleteMeasurementLog, updateLog: updateMeasurementLog, isDeleting: isDeletingMeas, isUpdating: isUpdatingMeas } = useMeasurementLogs(selectedPetId);

  // Combine all logs for timeline
  const allLogs = useMemo(() => {
    let logs: ((FoodLog | PoopLog | SupplementLog | MeasurementLog) & { type: 'food' | 'poop' | 'supplement' | 'measurement' })[] = [];
    
    if (filter === 'all' || filter === 'food') {
      logs = [...logs, ...foodLogs.map(l => ({ ...l, type: 'food' as const }))];
    }
    if (filter === 'all' || filter === 'poop') {
      logs = [...logs, ...poopLogs.map(l => ({ ...l, type: 'poop' as const }))];
    }
    if (filter === 'all' || filter === 'supplement') {
      logs = [...logs, ...supplementLogs.map(l => ({ ...l, type: 'supplement' as const }))];
    }
    if (filter === 'all' || filter === 'measurement') {
      logs = [...logs, ...measurementLogs.map(l => ({ ...l, type: 'measurement' as const }))];
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [foodLogs, poopLogs, supplementLogs, measurementLogs, filter]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof allLogs> = {};
    allLogs.forEach(log => {
      const dateKey = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });
    return groups;
  }, [allLogs]);

  // Chart data
  const weightChartData = useMemo(() => {
    return measurementLogs
      .filter(l => l.weightKg)
      .slice(0, 20)
      .reverse()
      .map(l => ({
        date: format(new Date(l.timestamp), 'MMM d'),
        weight: l.weightKg,
      }));
  }, [measurementLogs]);

  // Poop rating chart data
  const poopRatingData = useMemo(() => {
    return poopLogs
      .filter(l => l.userRating)
      .slice(0, 20)
      .reverse()
      .map(l => ({
        date: format(new Date(l.timestamp), 'MMM d'),
        rating: l.userRating,
      }));
  }, [poopLogs]);

  const handleDelete = async (type: string, logId: string) => {
    try {
      switch (type) {
        case 'food':
          await deleteFoodLog(logId);
          break;
        case 'poop':
          await deletePoopLog(logId);
          break;
        case 'supplement':
          await deleteSupplementLog(logId);
          break;
        case 'measurement':
          await deleteMeasurementLog(logId);
          break;
      }
      toast({ title: "Log deleted" });
    } catch (error: any) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (type: string, log: any) => {
    setEditingLog({ type, log } as EditingLog);
  };

  const filterButtons = [
    { value: 'all', label: 'All', icon: null },
    { value: 'food', label: 'Food', icon: UtensilsCrossed },
    { value: 'poop', label: 'Poop', icon: Target },
    { value: 'supplement', label: 'Supps', icon: Pill },
    { value: 'measurement', label: 'Measure', icon: Ruler },
  ] as const;

  return (
    <MobileLayout>
      <PageHeader title="History" />

      <PageContent>
        {/* Pet Selector */}
        <div className="mb-6">
          <PetSelector
            pets={pets}
            selectedPetId={selectedPetId}
            onSelectPet={setSelectedPetId}
            showAddButton={false}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all",
              activeTab === 'timeline'
                ? "bg-primary text-primary-foreground"
                : "bg-card-muted"
            )}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-all",
              activeTab === 'charts'
                ? "bg-primary text-primary-foreground"
                : "bg-card-muted"
            )}
          >
            Charts
          </button>
        </div>

        {activeTab === 'timeline' && (
          <>
            {/* Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    filter === btn.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card-muted hover:bg-card-subtle"
                  )}
                >
                  {btn.icon && <btn.icon className="w-3.5 h-3.5" />}
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {Object.keys(groupedLogs).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No logs yet for {selectedPet?.name || 'this pet'}. Start tracking!</p>
                </div>
              ) : (
                Object.entries(groupedLogs).map(([dateKey, logs]) => (
                  <div key={dateKey}>
                    <h3 className="font-display font-medium mb-3">
                      {format(new Date(dateKey), 'EEEE, MMMM d')}
                    </h3>
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <LogItem
                          key={log.id}
                          log={log}
                          onEdit={() => handleEdit(log.type, log)}
                          onDelete={() => handleDelete(log.type, log.id)}
                          isDeleting={isDeletingFood || isDeletingPoop || isDeletingSupp || isDeletingMeas}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Weight Chart */}
            <div className="card-nude">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-medium">Weight Trend</h3>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              {weightChartData.length > 0 ? (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightChartData}>
                      <defs>
                        <linearGradient id="weightGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(5, 23%, 90%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(5, 23%, 90%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(22, 24%, 40%)' }}
                      />
                      <YAxis
                        domain={['dataMin - 0.2', 'dataMax + 0.2']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(22, 24%, 40%)' }}
                        width={30}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(22, 24%, 21%)"
                        strokeWidth={2}
                        fill="url(#weightGradient2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No weight data yet
                </p>
              )}
            </div>

            {/* Poop Rating Chart */}
            <div className="card-nude">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-medium">Poop Quality Trend</h3>
                <Star className="w-4 h-4 text-muted-foreground" />
              </div>
              {poopRatingData.length > 0 ? (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={poopRatingData}>
                      <defs>
                        <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(22, 24%, 40%)' }}
                      />
                      <YAxis
                        domain={[1, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(22, 24%, 40%)' }}
                        width={20}
                      />
                      <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="hsl(142, 76%, 36%)"
                        strokeWidth={2}
                        fill="url(#ratingGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No poop ratings yet
                </p>
              )}
            </div>

            {/* Activity Summary */}
            <div className="card-nude">
              <h3 className="font-display font-medium mb-4">Activity Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-display font-semibold">{foodLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Food Logs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-display font-semibold">{poopLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Poop Logs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-display font-semibold">{supplementLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Supplements</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-display font-semibold">{measurementLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Measurements</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContent>

      {/* Edit Sheets */}
      <EditFoodSheet 
        log={editingLog?.type === 'food' ? editingLog.log : null}
        onClose={() => setEditingLog(null)}
        onSave={updateFoodLog}
        isUpdating={isUpdatingFood}
      />
      <EditPoopSheet 
        log={editingLog?.type === 'poop' ? editingLog.log : null}
        onClose={() => setEditingLog(null)}
        onSave={updatePoopLog}
        isUpdating={isUpdatingPoop}
      />
      <EditSupplementSheet 
        log={editingLog?.type === 'supplement' ? editingLog.log : null}
        onClose={() => setEditingLog(null)}
        onSave={updateSupplementLog}
        isUpdating={isUpdatingSupp}
      />
      <EditMeasurementSheet 
        log={editingLog?.type === 'measurement' ? editingLog.log : null}
        onClose={() => setEditingLog(null)}
        onSave={updateMeasurementLog}
        isUpdating={isUpdatingMeas}
      />

      <BottomNav />
    </MobileLayout>
  );
}

// Edit Food Sheet
function EditFoodSheet({ log, onClose, onSave, isUpdating }: { log: FoodLog | null; onClose: () => void; onSave: (data: FoodLog) => Promise<any>; isUpdating: boolean }) {
  const [formData, setFormData] = useState({ foodName: '', amountGrams: '', notes: '', date: '', time: '' });
  
  const isOpen = !!log;
  
  useEffect(() => {
    if (log) {
      const date = new Date(log.timestamp);
      setFormData({
        foodName: log.foodName,
        amountGrams: log.amountGrams?.toString() || '',
        notes: log.notes || '',
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'HH:mm'),
      });
    }
  }, [log]);

  const handleSave = async () => {
    if (!log) return;
    try {
      await onSave({
        ...log,
        foodName: formData.foodName,
        amountGrams: formData.amountGrams ? parseInt(formData.amountGrams) : 0,
        notes: formData.notes || undefined,
        timestamp: new Date(`${formData.date}T${formData.time}`).toISOString(),
      });
      toast({ title: "Log updated" });
      onClose();
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    }
  };

  if (!log) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Food Log</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {log.photoUrl && (
            <div>
              <label className="text-sm font-medium mb-2 block">Photo</label>
              <img src={log.photoUrl} alt="Food photo" className="w-full h-40 object-cover rounded-xl" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                placeholder="2024-05-01"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input
                type="time"
                placeholder="08:30"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Food Name</label>
            <Input
              placeholder="e.g., Turkey kibble"
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Amount (grams)</label>
            <Input
              type="number"
              placeholder="120"
              value={formData.amountGrams}
              onChange={(e) => setFormData({ ...formData, amountGrams: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <textarea
              placeholder="e.g., Ate slower than usual"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-20 rounded-xl bg-card-subtle px-4 py-3 text-foreground resize-none"
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Edit Poop Sheet
function EditPoopSheet({ log, onClose, onSave, isUpdating }: { log: PoopLog | null; onClose: () => void; onSave: (data: PoopLog) => Promise<any>; isUpdating: boolean }) {
  const [formData, setFormData] = useState({ consistency: '', color: '', amount: '', userRating: undefined as number | undefined, notes: '', date: '', time: '' });
  
  const isOpen = !!log;
  
  useEffect(() => {
    if (log) {
      const date = new Date(log.timestamp);
      setFormData({
        consistency: log.consistency,
        color: log.color,
        amount: log.amount,
        userRating: log.userRating,
        notes: log.notes || '',
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'HH:mm'),
      });
    }
  }, [log]);

  const handleSave = async () => {
    if (!log) return;
    try {
      await onSave({
        ...log,
        consistency: formData.consistency as PoopLog['consistency'],
        color: formData.color as PoopLog['color'],
        amount: formData.amount as PoopLog['amount'],
        userRating: formData.userRating,
        notes: formData.notes || undefined,
        timestamp: new Date(`${formData.date}T${formData.time}`).toISOString(),
      });
      toast({ title: "Log updated" });
      onClose();
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    }
  };

  if (!log) return null;

  const consistencyOptions = ['solid', 'soft', 'runny', 'hard'];
  const colorOptions = ['brown', 'dark_brown', 'light_brown', 'black', 'red', 'green'];
  const amountOptions = ['small', 'medium', 'large'];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Poop Log</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {log.photoUrl && (
            <div>
              <label className="text-sm font-medium mb-2 block">Photo</label>
              <img src={log.photoUrl} alt="Poop photo" className="w-full h-40 object-cover rounded-xl" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                placeholder="2024-05-01"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input
                type="time"
                placeholder="08:30"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Consistency</label>
            <div className="flex flex-wrap gap-2">
              {consistencyOptions.map((opt) => (
                <button key={opt} onClick={() => setFormData({ ...formData, consistency: opt })} className={cn("px-3 py-2 rounded-lg text-sm capitalize", formData.consistency === opt ? "bg-primary text-primary-foreground" : "bg-card-muted")}>{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((opt) => (
                <button key={opt} onClick={() => setFormData({ ...formData, color: opt })} className={cn("px-3 py-2 rounded-lg text-sm capitalize", formData.color === opt ? "bg-primary text-primary-foreground" : "bg-card-muted")}>{opt.replace('_', ' ')}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <div className="flex gap-2">
              {amountOptions.map((opt) => (
                <button key={opt} onClick={() => setFormData({ ...formData, amount: opt })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm capitalize", formData.amount === opt ? "bg-primary text-primary-foreground" : "bg-card-muted")}>{opt}</button>
              ))}
            </div>
          </div>
          <RatingSlider value={formData.userRating} onChange={(rating) => setFormData({ ...formData, userRating: rating })} />
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <textarea
              placeholder="e.g., Slight mucus today"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-20 rounded-xl bg-card-subtle px-4 py-3 text-foreground resize-none"
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Edit Supplement Sheet
function EditSupplementSheet({ log, onClose, onSave, isUpdating }: { log: SupplementLog | null; onClose: () => void; onSave: (data: SupplementLog) => Promise<any>; isUpdating: boolean }) {
  const [formData, setFormData] = useState({ supplementName: '', dosage: '', frequency: '', notes: '', date: '', time: '' });
  
  const isOpen = !!log;
  
  useEffect(() => {
    if (log) {
      const date = new Date(log.timestamp);
      setFormData({
        supplementName: log.supplementName,
        dosage: log.dosage || '',
        frequency: log.frequency || 'daily',
        notes: log.notes || '',
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'HH:mm'),
      });
    }
  }, [log]);

  const handleSave = async () => {
    if (!log) return;
    try {
      await onSave({
        ...log,
        supplementName: formData.supplementName,
        dosage: formData.dosage || '',
        frequency: formData.frequency as SupplementLog['frequency'],
        notes: formData.notes || undefined,
        timestamp: new Date(`${formData.date}T${formData.time}`).toISOString(),
      });
      toast({ title: "Log updated" });
      onClose();
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    }
  };

  if (!log) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Supplement Log</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {log.photoUrl && (
            <div>
              <label className="text-sm font-medium mb-2 block">Photo</label>
              <img src={log.photoUrl} alt="Supplement photo" className="w-full h-40 object-cover rounded-xl" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                placeholder="2024-05-01"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input
                type="time"
                placeholder="08:30"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Supplement Name</label>
            <Input
              placeholder="e.g., Omega 3"
              value={formData.supplementName}
              onChange={(e) => setFormData({ ...formData, supplementName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Dosage</label>
            <Input
              placeholder="e.g., 1 capsule"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Frequency</label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'as_needed'].map((opt) => (
                <button key={opt} onClick={() => setFormData({ ...formData, frequency: opt })} className={cn("flex-1 px-3 py-2 rounded-lg text-sm capitalize", formData.frequency === opt ? "bg-primary text-primary-foreground" : "bg-card-muted")}>{opt.replace('_', ' ')}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <textarea
              placeholder="e.g., Give with dinner only"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-20 rounded-xl bg-card-subtle px-4 py-3 text-foreground resize-none"
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Edit Measurement Sheet
function EditMeasurementSheet({ log, onClose, onSave, isUpdating }: { log: MeasurementLog | null; onClose: () => void; onSave: (data: MeasurementLog) => Promise<any>; isUpdating: boolean }) {
  const [formData, setFormData] = useState({ weightKg: '', neckCm: '', chestCm: '', bodyLengthCm: '', notes: '', date: '', time: '' });
  
  const isOpen = !!log;
  
  useEffect(() => {
    if (log) {
      const date = new Date(log.timestamp);
      setFormData({
        weightKg: log.weightKg?.toString() || '',
        neckCm: log.neckCm?.toString() || '',
        chestCm: log.chestCm?.toString() || '',
        bodyLengthCm: log.bodyLengthCm?.toString() || '',
        notes: log.notes || '',
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'HH:mm'),
      });
    }
  }, [log]);

  const handleSave = async () => {
    if (!log) return;
    try {
      await onSave({
        ...log,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
        neckCm: formData.neckCm ? parseFloat(formData.neckCm) : undefined,
        chestCm: formData.chestCm ? parseFloat(formData.chestCm) : undefined,
        bodyLengthCm: formData.bodyLengthCm ? parseFloat(formData.bodyLengthCm) : undefined,
        notes: formData.notes || undefined,
        timestamp: new Date(`${formData.date}T${formData.time}`).toISOString(),
      });
      toast({ title: "Log updated" });
      onClose();
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    }
  };

  if (!log) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Measurement Log</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                placeholder="2024-05-01"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input
                type="time"
                placeholder="08:30"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="6.8"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Neck (cm)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="28"
              value={formData.neckCm}
              onChange={(e) => setFormData({ ...formData, neckCm: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Chest (cm)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="45"
              value={formData.chestCm}
              onChange={(e) => setFormData({ ...formData, chestCm: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Body Length (cm)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="52"
              value={formData.bodyLengthCm}
              onChange={(e) => setFormData({ ...formData, bodyLengthCm: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <textarea
              placeholder="e.g., Harness felt loose after weigh-in"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full h-20 rounded-xl bg-card-subtle px-4 py-3 text-foreground resize-none"
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
