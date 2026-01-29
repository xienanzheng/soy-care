import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VetContact {
  id: string;
  vetName?: string | null;
  clinic?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export function useVetContacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const contactQuery = useQuery({
    queryKey: ['vet-contact', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_vet_contacts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        vetName: data.vet_name,
        clinic: data.clinic,
        phone: data.phone,
        email: data.email,
        address: data.address,
        notes: data.notes,
      } as VetContact;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: Omit<VetContact, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('user_vet_contacts')
        .upsert(
          {
            user_id: user.id,
            vet_name: payload.vetName ?? null,
            clinic: payload.clinic ?? null,
            phone: payload.phone ?? null,
            email: payload.email ?? null,
            address: payload.address ?? null,
            notes: payload.notes ?? null,
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vet-contact', user?.id] });
    },
  });

  return {
    contact: contactQuery.data,
    isLoading: contactQuery.isLoading,
    saveContact: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
}
