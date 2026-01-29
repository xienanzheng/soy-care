import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function DateSelector({ selectedDate, onDateChange, className }: DateSelectorProps) {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: 7 }, (_, i) => addDays(subDays(today, 3), i));

  const goToPreviousWeek = () => {
    onDateChange(subDays(selectedDate, 7));
  };

  const goToNextWeek = () => {
    onDateChange(addDays(selectedDate, 7));
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousWeek}
        className="w-8 h-8 shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateChange(date)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-all min-w-[48px]",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-card-muted"
              )}
            >
              <span className={cn(
                "text-xs uppercase",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {format(date, 'EEE')}
              </span>
              <span className={cn(
                "text-lg font-medium",
                isToday && !isSelected && "text-primary"
              )}>
                {format(date, 'd')}
              </span>
            </button>
          );
        })}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextWeek}
        className="w-8 h-8 shrink-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
