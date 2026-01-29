import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PetAvatar } from './PetAvatar';
import { Pet } from '@/types/pet';
import { cn } from '@/lib/utils';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelectPet: (petId: string) => void;
  showAddButton?: boolean;
}

export function PetSelector({ 
  pets, 
  selectedPetId, 
  onSelectPet,
  showAddButton = true 
}: PetSelectorProps) {
  const navigate = useNavigate();

  if (pets.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {pets.map((pet) => (
        <button
          key={pet.id}
          onClick={() => onSelectPet(pet.id)}
          className={cn(
            "flex flex-col items-center gap-1.5 min-w-[64px] transition-all",
            selectedPetId === pet.id ? "opacity-100" : "opacity-60 hover:opacity-80"
          )}
        >
          <div
            className={cn(
              "rounded-full p-0.5 transition-all",
              selectedPetId === pet.id 
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                : ""
            )}
          >
            <PetAvatar
              photoUrl={pet.photoUrl}
              name={pet.name}
              size="md"
            />
          </div>
          <span className={cn(
            "text-xs font-medium truncate max-w-[64px]",
            selectedPetId === pet.id ? "text-foreground" : "text-muted-foreground"
          )}>
            {pet.name}
          </span>
        </button>
      ))}
      
      {showAddButton && (
        <button
          onClick={() => navigate('/onboarding')}
          className="flex flex-col items-center gap-1.5 min-w-[64px] opacity-60 hover:opacity-80 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-card-muted border-2 border-dashed border-border flex items-center justify-center">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Add</span>
        </button>
      )}
    </div>
  );
}
