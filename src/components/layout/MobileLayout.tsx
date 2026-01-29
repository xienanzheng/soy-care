import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
}

export function MobileLayout({ children, className, showNav = true }: MobileLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col max-w-[430px] mx-auto",
      className
    )}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, leftAction, rightAction, className }: PageHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background/80 backdrop-blur-lg safe-top",
      "px-4 py-3 flex items-center justify-between",
      className
    )}>
      <div className="w-10 flex justify-start">
        {leftAction}
      </div>
      <div className="flex-1 text-center">
        {title && <h1 className="text-lg font-display font-medium">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <main className={cn("flex-1 px-4 pb-20", className)}>
      {children}
    </main>
  );
}
