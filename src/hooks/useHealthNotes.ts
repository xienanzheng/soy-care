import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HealthNote } from '@/types/pet';
import { useAuth } from '@/contexts/AuthContext';

export function useHealthNotes(petId: string | null) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['health_notes', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('health_notes')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(
        (note): HealthNote => ({
          id: note.id,
          petId: note.pet_id,
          summary: note.summary,
          recommendations: note.recommendations || undefined,
          riskLevel: note.risk_level as HealthNote['riskLevel'],
          ownerMessage: note.owner_message || undefined,
          createdAt: note.created_at,
        })
      );
    },
    enabled: !!user && !!petId,
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}
