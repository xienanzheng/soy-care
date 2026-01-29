import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RewardMetrics {
  userId: string;
  credits: number;
  consecutiveDays: number;
  lastCheckIn?: string;
  totalEntries: number;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  delta: number;
  reason: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function useRewards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ['reward-metrics', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        userId: data.user_id,
        credits: data.credits ?? 0,
        consecutiveDays: data.consecutive_days ?? 0,
        lastCheckIn: data.last_checkin ?? undefined,
        totalEntries: data.total_entries ?? 0,
        updatedAt: data.updated_at,
      } as RewardMetrics;
    },
  });

  const transactionsQuery = useQuery({
    queryKey: ['reward-transactions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        delta: row.delta,
        reason: row.reason,
        metadata: row.metadata ?? undefined,
        createdAt: row.created_at,
      })) as CreditTransaction[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reward-metrics', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['reward-transactions', user?.id] });
  };

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error, data } = await supabase.rpc('reward_daily_checkin');
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(),
  });

  const recordActivityMutation = useMutation({
    mutationFn: async (activity: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.rpc('reward_for_activity', {
        activity_name: activity,
        event_metadata: {},
      });
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });

  const spendCreditsMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.rpc('spend_credits', {
        spend_amount: amount,
        spend_reason: reason,
        event_metadata: {},
      });
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });

  const streakProgress = useMemo(() => {
    if (!metricsQuery.data) return 0;
    return Math.min(1, metricsQuery.data.consecutiveDays / 7);
  }, [metricsQuery.data]);

  return {
    metrics: metricsQuery.data,
    isLoading: metricsQuery.isLoading,
    transactions: transactionsQuery.data ?? [],
    isClaiming: checkInMutation.isPending,
    claimDaily: checkInMutation.mutateAsync,
    recordActivity: recordActivityMutation.mutateAsync,
    spendCredits: spendCreditsMutation.mutateAsync,
    streakProgress,
  };
}
