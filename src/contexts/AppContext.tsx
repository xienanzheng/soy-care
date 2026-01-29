import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pet } from '@/types/pet';
import { usePets } from '@/hooks/usePets';

interface AppContextType {
  // Pets
  pets: Pet[];
  petsLoading: boolean;
  selectedPetId: string | null;
  setSelectedPetId: (id: string | null) => void;
  selectedPet: Pet | null;
  createPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updatePet: (pet: Partial<Pet> & { id: string }) => Promise<any>;
  deletePet: (petId: string) => Promise<void>;
  isCreatingPet: boolean;
  isUpdatingPet: boolean;
  isDeletingPet: boolean;
  
  // Selected date for dashboard
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { 
    pets, 
    isLoading: petsLoading, 
    createPet, 
    updatePet,
    deletePet,
    isCreating: isCreatingPet,
    isUpdating: isUpdatingPet,
    isDeleting: isDeletingPet,
  } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Auto-select first pet when pets load
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  // Reset selection if selected pet was deleted
  useEffect(() => {
    if (selectedPetId && pets.length > 0 && !pets.find(p => p.id === selectedPetId)) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const selectedPet = pets.find(p => p.id === selectedPetId) || null;

  return (
    <AppContext.Provider
      value={{
        pets,
        petsLoading,
        selectedPetId,
        setSelectedPetId,
        selectedPet,
        createPet,
        updatePet,
        deletePet,
        isCreatingPet,
        isUpdatingPet,
        isDeletingPet,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
