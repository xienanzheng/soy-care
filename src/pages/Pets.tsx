import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, PawPrint, Pencil } from 'lucide-react';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { PetAvatar } from '@/components/common/PetAvatar';
import { EmptyStateCard } from '@/components/common/SummaryCard';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { formatPetAge } from '@/lib/petAge';

export default function Pets() {
  const navigate = useNavigate();
  const { pets, petsLoading, selectedPetId, setSelectedPetId } = useApp();

  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
    navigate('/dashboard');
  };

  const handleEditPet = (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    navigate(`/pets/${petId}/edit`);
  };

  if (petsLoading) {
    return (
      <MobileLayout>
        <PageHeader title="My Pets" />
        <PageContent className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </PageContent>
        <BottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <PageHeader
        title="My Pets"
        rightAction={
          <button
            onClick={() => navigate('/onboarding')}
            className="p-2 -mr-2 text-primary"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <PageContent>
        {pets.length === 0 ? (
          <EmptyStateCard
            icon={PawPrint}
            title="No pets yet"
            description="Add your first pet to start tracking their health and wellness"
            action={
              <Button onClick={() => navigate('/onboarding')}>
                Add Pet
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => handleSelectPet(pet.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card-muted transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PetAvatar
                  photoUrl={pet.photoUrl}
                  name={pet.name}
                  size="lg"
                />
                <div className="flex-1 text-left">
                  <h3 className="font-display font-medium text-lg">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pet.species} • {pet.breed}
                    {pet.dateOfBirth && ` • ${formatPetAge(pet.dateOfBirth)}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    @{pet.handle}
                  </p>
                </div>
                {selectedPetId === pet.id && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary text-primary-foreground">
                    Active
                  </span>
                )}
                <button
                  onClick={(e) => handleEditPet(e, pet.id)}
                  className="p-2 rounded-full hover:bg-card-subtle transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </PageContent>

      <BottomNav />
    </MobileLayout>
  );
}
