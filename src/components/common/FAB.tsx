import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Pill, Target, Ruler } from 'lucide-react';

const actions = [
  { path: '/add-food', icon: UtensilsCrossed, label: 'Add Food', color: 'bg-secondary' },
  { path: '/add-poop', icon: Target, label: 'Add Poop', color: 'bg-accent-pink' },
  { path: '/add-supplement', icon: Pill, label: 'Add Supplement', color: 'bg-accent-blue' },
  { path: '/add-measurement', icon: Ruler, label: 'Add Measurement', color: 'bg-card-muted' },
];

export function FAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action buttons */}
      <div className={cn(
        "fixed right-6 z-50 flex flex-col-reverse items-end gap-3 transition-all duration-300",
        isOpen ? "bottom-24" : "bottom-24 pointer-events-none opacity-0"
      )}>
        {actions.map((action, index) => (
          <button
            key={action.path}
            onClick={() => handleAction(action.path)}
            className={cn(
              "flex items-center gap-3 pr-4 pl-3 py-2.5 rounded-full shadow-lg transition-all",
              action.color,
              isOpen ? "animate-fade-up" : "opacity-0"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-10 h-10 rounded-full bg-background/40 flex items-center justify-center">
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="fab"
        className={cn(
          "fixed bottom-20 right-6 z-50 transition-transform duration-200",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </>
  );
}
