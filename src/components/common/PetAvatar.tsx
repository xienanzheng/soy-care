import { cn } from '@/lib/utils';
import { PawPrint } from 'lucide-react';

interface PetAvatarProps {
  photoUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

export function PetAvatar({ photoUrl, name, size = 'md', className }: PetAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-card-muted flex items-center justify-center overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <PawPrint className={cn(
          "text-muted-foreground",
          size === 'sm' && 'w-5 h-5',
          size === 'md' && 'w-6 h-6',
          size === 'lg' && 'w-8 h-8',
          size === 'xl' && 'w-12 h-12',
        )} />
      )}
    </div>
  );
}
