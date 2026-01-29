import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChallengeProgress } from '@/types/pet';

export function useChallenges(petId: string | null) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['pet_challenges', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('pet_challenges')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(
        (record): ChallengeProgress => ({
          id: record.id,
          petId: record.pet_id,
          title: record.title,
          subtitle: record.subtitle || undefined,
          progress: Number(record.progress ?? 0),
          goal: Number(record.goal ?? 1),
          streakDays: record.streak_days || undefined,
        })
      );
    },
    enabled: !!user && !!petId,
  });

  return {
    challenges: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
