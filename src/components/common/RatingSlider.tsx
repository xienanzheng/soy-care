import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingSliderProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  className?: string;
}

export function RatingSlider({ value, onChange, className }: RatingSliderProps) {
  const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getRatingColor = (rating: number) => {
    if (rating <= 3) return 'bg-destructive/20 border-destructive/40 text-destructive';
    if (rating <= 5) return 'bg-orange-100 border-orange-300 text-orange-600';
    if (rating <= 7) return 'bg-yellow-100 border-yellow-400 text-yellow-700';
    return 'bg-green-100 border-green-400 text-green-700';
  };

  const getRatingLabel = (rating: number) => {
    if (rating <= 2) return 'Concerning';
    if (rating <= 4) return 'Not great';
    if (rating <= 6) return 'Okay';
    if (rating <= 8) return 'Good';
    return 'Excellent';
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Your Rating</span>
        </div>
        {value && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            getRatingColor(value)
          )}>
            {getRatingLabel(value)}
          </span>
        )}
      </div>
      
      <div className="flex gap-1.5">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(value === rating ? undefined : rating)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border",
              value === rating
                ? getRatingColor(rating)
                : "bg-card-muted border-transparent hover:bg-card-subtle"
            )}
          >
            {rating}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Poor</span>
        <span>Perfect</span>
      </div>
    </div>
  );
}