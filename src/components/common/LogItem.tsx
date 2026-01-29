import { useState } from 'react';
import { format } from 'date-fns';
import { UtensilsCrossed, Target, Pill, Ruler, Pencil, Trash2, Star, MapPin, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { FoodLog, PoopLog, SupplementLog, MeasurementLog } from '@/types/pet';

const BEHAVIOR_LABELS: Record<string, string> = {
  not_applicable: 'Not applicable',
  undesirable_behavior: 'Undesirable behavior',
  lip_paws: 'Lip paws',
  vomit: 'Vomit',
  other: 'Other noted',
};

type LogType = 'food' | 'poop' | 'supplement' | 'measurement';

interface LogItemProps {
  log: (FoodLog | PoopLog | SupplementLog | MeasurementLog) & { type: LogType };
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function LogItem({ log, onEdit, onDelete, isDeleting }: LogItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);

  const getIcon = () => {
    switch (log.type) {
      case 'food': return UtensilsCrossed;
      case 'poop': return Target;
      case 'supplement': return Pill;
      case 'measurement': return Ruler;
    }
  };

  const getColor = () => {
    switch (log.type) {
      case 'food': return 'bg-secondary/50';
      case 'poop': return 'bg-accent-pink/30';
      case 'supplement': return 'bg-accent/30';
      case 'measurement': return 'bg-card-muted';
    }
  };

  const getPhotoUrl = () => {
    if (log.type === 'poop') return (log as PoopLog).photoUrl;
    if (log.type === 'food') return (log as FoodLog).photoUrl;
    if (log.type === 'supplement') return (log as SupplementLog).photoUrl;
    return null;
  };

  const getCompactDetails = () => {
    switch (log.type) {
      case 'food':
        const food = log as FoodLog;
        return <span>{food.foodName} - {food.amountGrams}g</span>;
      case 'poop':
        const poop = log as PoopLog;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="capitalize">{poop.color.replace('_', ' ')} • {poop.consistency}</span>
            {poop.userRating && (
              <span className="flex items-center gap-0.5 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-primary text-primary" />
                {poop.userRating}
              </span>
            )}
            {poop.undesirableBehaviors && poop.undesirableBehaviors.length > 0 && !poop.undesirableBehaviors.includes('not_applicable') && (
              <span className="text-xs font-medium text-destructive">
                {poop.undesirableBehaviors
                  .map((value) => BEHAVIOR_LABELS[value] || value)
                  .join(', ')}
              </span>
            )}
          </div>
        );
      case 'supplement':
        const supp = log as SupplementLog;
        return <span>{supp.supplementName} - {supp.dosage}</span>;
      case 'measurement':
        const m = log as MeasurementLog;
        const parts = [];
        if (m.weightKg) parts.push(`${m.weightKg}kg`);
        if (m.neckCm) parts.push(`Neck: ${m.neckCm}cm`);
        return <span>{parts.join(' • ') || 'Measurements'}</span>;
    }
  };

  const getExpandedDetails = () => {
    switch (log.type) {
      case 'food':
        const food = log as FoodLog;
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Food:</span> {food.foodName}</div>
              <div><span className="text-muted-foreground">Amount:</span> {food.amountGrams}g</div>
              {food.mealType && <div><span className="text-muted-foreground">Meal:</span> {food.mealType}</div>}
            </div>
            {food.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1">{food.notes}</p>
              </div>
            )}
          </div>
        );
      case 'poop':
        const poop = log as PoopLog;
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Color:</span> <span className="capitalize">{poop.color.replace('_', ' ')}</span></div>
              <div><span className="text-muted-foreground">Consistency:</span> <span className="capitalize">{poop.consistency}</span></div>
              <div><span className="text-muted-foreground">Amount:</span> <span className="capitalize">{poop.amount}</span></div>
              {poop.userRating && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Rating:</span>
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  {poop.userRating}/10
                </div>
              )}
            </div>
            {poop.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span>{poop.location}</span>
              </div>
            )}
            {poop.undesirableBehaviors && poop.undesirableBehaviors.length > 0 && (
              <div>
                <span className="text-muted-foreground">Behavior flags:</span>
                <p className="mt-1">
                  {poop.undesirableBehaviors
                    .map((value) => BEHAVIOR_LABELS[value] || value)
                    .join(', ')}
                </p>
                {poop.undesirableBehaviorNotes && (
                  <p className="mt-1 text-sm">{poop.undesirableBehaviorNotes}</p>
                )}
              </div>
            )}
            {poop.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1">{poop.notes}</p>
              </div>
            )}
          </div>
        );
      case 'supplement':
        const supp = log as SupplementLog;
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Supplement:</span> {supp.supplementName}</div>
              {supp.dosage && <div><span className="text-muted-foreground">Dosage:</span> {supp.dosage}</div>}
              {supp.frequency && <div><span className="text-muted-foreground">Frequency:</span> {supp.frequency}</div>}
            </div>
            {supp.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1">{supp.notes}</p>
              </div>
            )}
          </div>
        );
      case 'measurement':
        const m = log as MeasurementLog;
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {m.weightKg && <div><span className="text-muted-foreground">Weight:</span> {m.weightKg}kg</div>}
              {m.neckCm && <div><span className="text-muted-foreground">Neck:</span> {m.neckCm}cm</div>}
              {m.chestCm && <div><span className="text-muted-foreground">Chest:</span> {m.chestCm}cm</div>}
              {m.bodyLengthCm && <div><span className="text-muted-foreground">Body Length:</span> {m.bodyLengthCm}cm</div>}
            </div>
            {m.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1">{m.notes}</p>
              </div>
            )}
          </div>
        );
    }
  };

  const Icon = getIcon();
  const photoUrl = getPhotoUrl();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) return;
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div 
        className={cn(
          "rounded-xl group cursor-pointer transition-all duration-200",
          getColor(),
          isExpanded && "ring-2 ring-primary/20"
        )}
        onClick={handleCardClick}
      >
        {/* Compact View */}
        <div className="flex items-center gap-3 p-3">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt="Log photo" 
              className="w-10 h-10 rounded-xl object-cover shrink-0" 
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium capitalize">{log.type}</p>
            <div className="text-sm text-muted-foreground">
              {getCompactDetails()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">
              {format(new Date(log.timestamp), 'h:mm a')}
            </span>
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )} 
            />
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="px-3 pb-3 space-y-3 animate-fade-in">
            {/* Full-size Photo */}
            {photoUrl && (
              <div 
                className="relative rounded-xl overflow-hidden cursor-zoom-in"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhotoDialog(true);
                }}
              >
                <img 
                  src={photoUrl} 
                  alt="Log photo" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-white/0 hover:text-white/80 text-sm font-medium">Tap to view full size</span>
                </div>
              </div>
            )}

            {/* Full Details */}
            <div className="bg-background/50 rounded-xl p-3">
              {getExpandedDetails()}
            </div>

            {/* Action Buttons */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 pt-1">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-background hover:bg-background/80 transition-colors text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors text-sm font-medium"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-size Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90 border-none">
          <DialogClose className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
            <X className="w-5 h-5" />
          </DialogClose>
          {photoUrl && (
            <img 
              src={photoUrl} 
              alt="Log photo full size" 
              className="w-full h-full object-contain max-h-[90vh]"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this log?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {log.type} log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
