import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Pet } from '@/types/pet';

export function usePets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const petsQuery = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map((pet): Pet => ({
        id: pet.id,
        name: pet.name,
        handle: pet.handle,
        species: pet.species,
        breed: pet.breed,
        gender: pet.gender as 'male' | 'female' | 'other',
        dateOfBirth: pet.date_of_birth || undefined,
        photoUrl: pet.photo_url || undefined,
        createdAt: pet.created_at,
        updatedAt: pet.updated_at,
        ownerName: (pet as any).owner_name || undefined,
        medicalHistory: (pet as any).medical_history || undefined,
        allergies: (pet as any).allergies || undefined,
        favoriteActivities: (pet as any).favorite_activities || undefined,
        personality: (pet as any).personality || undefined,
      }));
    },
    enabled: !!user,
  });

  const createPetMutation = useMutation({
    mutationFn: async (pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pets')
        .insert({
          user_id: user.id,
          name: pet.name,
          handle: pet.handle,
          species: pet.species,
          breed: pet.breed,
          gender: pet.gender,
          date_of_birth: pet.dateOfBirth || null,
          photo_url: pet.photoUrl || null,
          owner_name: pet.ownerName || null,
          medical_history: pet.medicalHistory || null,
          allergies: pet.allergies || null,
          favorite_activities: pet.favoriteActivities || null,
          personality: pet.personality || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async ({ id, ...pet }: Partial<Pet> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pets')
        .update({
          name: pet.name,
          handle: pet.handle,
          species: pet.species,
          breed: pet.breed,
          gender: pet.gender,
          date_of_birth: pet.dateOfBirth || null,
          photo_url: pet.photoUrl || null,
          owner_name: pet.ownerName || null,
          medical_history: pet.medicalHistory || null,
          allergies: pet.allergies || null,
          favorite_activities: pet.favoriteActivities || null,
          personality: pet.personality || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
    },
  });

  return {
    pets: petsQuery.data ?? [],
    isLoading: petsQuery.isLoading,
    error: petsQuery.error,
    createPet: createPetMutation.mutateAsync,
    updatePet: updatePetMutation.mutateAsync,
    deletePet: deletePetMutation.mutateAsync,
    isCreating: createPetMutation.isPending,
    isUpdating: updatePetMutation.isPending,
    isDeleting: deletePetMutation.isPending,
  };
}
