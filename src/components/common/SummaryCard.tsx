import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function SummaryCard({ icon: Icon, title, value, subtitle, className, onClick }: SummaryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "card-nude text-left w-full transition-all hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center">
          <Icon className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-xl font-display font-medium truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </button>
  );
}

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyStateCard({ icon: Icon, title, description, action, className }: EmptyStateCardProps) {
  return (
    <div className={cn(
      "rounded-2xl bg-accent-pink/30 p-6 text-center",
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-display font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  );
}
