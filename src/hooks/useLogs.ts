import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FoodLog, SupplementLog, PoopLog, MeasurementLog } from '@/types/pet';
import { awardActivityCredit } from '@/lib/rewards';

export function useFoodLogs(petId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['food_logs', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('logged_at', { ascending: false });

      if (error) throw error;

      return data.map((log): FoodLog => ({
        id: log.id,
        petId: log.pet_id,
        foodName: log.name,
        amountGrams: Number(log.amount_grams) || 0,
        mealType: log.meal_type as FoodLog['mealType'],
        notes: log.notes || undefined,
        timestamp: log.logged_at,
        photoUrl: log.photo_url || undefined,
        calories: log.calories ? Number(log.calories) : undefined,
        proteinPercent: log.protein_percent ? Number(log.protein_percent) : undefined,
        fatPercent: log.fat_percent ? Number(log.fat_percent) : undefined,
        carbPercent: log.carb_percent ? Number(log.carb_percent) : undefined,
      }));
    },
    enabled: !!user && !!petId,
  });

  const createMutation = useMutation({
    mutationFn: async (log: Omit<FoodLog, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          pet_id: log.petId,
          user_id: user.id,
          name: log.foodName,
          amount_grams: log.amountGrams,
          meal_type: log.mealType,
          notes: log.notes || null,
          photo_url: log.photoUrl || null,
          logged_at: log.timestamp,
          calories: log.calories || null,
          protein_percent: log.proteinPercent || null,
          fat_percent: log.fatPercent || null,
          carb_percent: log.carbPercent || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['food_logs', petId] });
      awardActivityCredit('food_log', { log_id: data?.id });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (log: FoodLog) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('food_logs')
        .update({
          name: log.foodName,
          amount_grams: log.amountGrams,
          meal_type: log.mealType,
          notes: log.notes || null,
          photo_url: log.photoUrl || null,
          logged_at: log.timestamp,
          calories: log.calories || null,
          protein_percent: log.proteinPercent || null,
          fat_percent: log.fatPercent || null,
          carb_percent: log.carbPercent || null,
        })
        .eq('id', log.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food_logs', petId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food_logs', petId] });
    },
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateLog: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteLog: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useSupplementLogs(petId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['supplement_logs', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('supplement_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('logged_at', { ascending: false });

      if (error) throw error;

      return data.map((log): SupplementLog => ({
        id: log.id,
        petId: log.pet_id,
        supplementName: log.name,
        dosage: log.dosage || '',
        frequency: log.frequency as SupplementLog['frequency'],
        notes: log.notes || undefined,
        photoUrl: log.photo_url || undefined,
        timestamp: log.logged_at,
        purpose: log.purpose || undefined,
      }));
    },
    enabled: !!user && !!petId,
  });

  const createMutation = useMutation({
    mutationFn: async (log: Omit<SupplementLog, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('supplement_logs')
        .insert({
          pet_id: log.petId,
          user_id: user.id,
          name: log.supplementName,
          dosage: log.dosage,
          frequency: log.frequency,
          notes: log.notes || null,
          photo_url: log.photoUrl || null,
          logged_at: log.timestamp,
          purpose: log.purpose || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplement_logs', petId] });
      awardActivityCredit('supplement_log', { log_id: data?.id });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (log: SupplementLog) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('supplement_logs')
        .update({
          name: log.supplementName,
          dosage: log.dosage,
          frequency: log.frequency,
          notes: log.notes || null,
          photo_url: log.photoUrl || null,
          logged_at: log.timestamp,
          purpose: log.purpose || null,
        })
        .eq('id', log.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplement_logs', petId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('supplement_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplement_logs', petId] });
    },
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateLog: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteLog: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePoopLogs(petId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['poop_logs', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('poop_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('logged_at', { ascending: false });

      if (error) throw error;

      return data.map((log): PoopLog => ({
        id: log.id,
        petId: log.pet_id,
        consistency: log.consistency as PoopLog['consistency'],
        color: log.color as PoopLog['color'],
        amount: log.amount as PoopLog['amount'],
        location: log.location || '',
        notes: log.notes || undefined,
        photoUrl: log.photo_url || undefined,
        thumbnailUrl: log.thumbnail_url || undefined,
        timestamp: log.logged_at,
        userRating: log.user_rating ?? undefined,
        aiStatus: log.ai_status as PoopLog['aiStatus'],
        aiLabels: log.ai_labels as Record<string, unknown> | undefined,
        aiSummary: log.ai_summary || undefined,
        aiRiskLevel: log.ai_risk_level as PoopLog['aiRiskLevel'],
        bloodPresent: log.blood_present ?? undefined,
        moistureLevel: log.moisture_level as PoopLog['moistureLevel'],
        mucusPresent: log.mucus_present ?? undefined,
        smellLevel: log.smell_level ? Number(log.smell_level) : undefined,
        undesirableBehaviors: log.undesirable_behaviors ?? undefined,
        undesirableBehaviorNotes: log.undesirable_behavior_notes ?? undefined,
      }));
    },
    enabled: !!user && !!petId,
  });

  const createMutation = useMutation({
    mutationFn: async (log: Omit<PoopLog, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('poop_logs')
        .insert({
          pet_id: log.petId,
          user_id: user.id,
          consistency: log.consistency,
          color: log.color,
          amount: log.amount,
          location: log.location || null,
          notes: log.notes || null,
          photo_url: log.photoUrl || null,
          thumbnail_url: log.thumbnailUrl || null,
          user_rating: log.userRating || null,
          ai_status: log.aiStatus,
          logged_at: log.timestamp,
          blood_present: typeof log.bloodPresent === 'boolean' ? log.bloodPresent : null,
          moisture_level: log.moistureLevel || null,
          mucus_present: typeof log.mucusPresent === 'boolean' ? log.mucusPresent : null,
          smell_level: log.smellLevel || null,
          undesirable_behaviors: log.undesirableBehaviors?.length ? log.undesirableBehaviors : null,
          undesirable_behavior_notes: log.undesirableBehaviorNotes || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['poop_logs', petId] });
      awardActivityCredit('poop_log', { log_id: data?.id });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (log: PoopLog) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('poop_logs')
        .update({
          consistency: log.consistency,
          color: log.color,
          amount: log.amount,
          location: log.location || null,
          notes: log.notes || null,
          photo_url: log.photoUrl || null,
          thumbnail_url: log.thumbnailUrl || null,
          user_rating: log.userRating || null,
          logged_at: log.timestamp,
          blood_present: typeof log.bloodPresent === 'boolean' ? log.bloodPresent : null,
          moisture_level: log.moistureLevel || null,
          mucus_present: typeof log.mucusPresent === 'boolean' ? log.mucusPresent : null,
          smell_level: log.smellLevel || null,
          undesirable_behaviors: log.undesirableBehaviors?.length ? log.undesirableBehaviors : null,
          undesirable_behavior_notes: log.undesirableBehaviorNotes || null,
        } as any)
        .eq('id', log.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poop_logs', petId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('poop_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poop_logs', petId] });
    },
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateLog: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteLog: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useMeasurementLogs(petId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['measurement_logs', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('measurement_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('logged_at', { ascending: false });

      if (error) throw error;

      return data.map((log): MeasurementLog => ({
        id: log.id,
        petId: log.pet_id,
        weightKg: log.weight_kg ? Number(log.weight_kg) : undefined,
        neckCm: log.neck_cm ? Number(log.neck_cm) : undefined,
        chestCm: log.chest_cm ? Number(log.chest_cm) : undefined,
        bodyLengthCm: log.body_length_cm ? Number(log.body_length_cm) : undefined,
        notes: log.notes || undefined,
        timestamp: log.logged_at,
      }));
    },
    enabled: !!user && !!petId,
  });

  const createMutation = useMutation({
    mutationFn: async (log: Omit<MeasurementLog, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('measurement_logs')
        .insert({
          pet_id: log.petId,
          user_id: user.id,
          weight_kg: log.weightKg || null,
          neck_cm: log.neckCm || null,
          chest_cm: log.chestCm || null,
          body_length_cm: log.bodyLengthCm || null,
          notes: log.notes || null,
          logged_at: log.timestamp,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['measurement_logs', petId] });
      awardActivityCredit('measurement_log', { log_id: data?.id });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (log: MeasurementLog) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('measurement_logs')
        .update({
          weight_kg: log.weightKg || null,
          neck_cm: log.neckCm || null,
          chest_cm: log.chestCm || null,
          body_length_cm: log.bodyLengthCm || null,
          notes: log.notes || null,
          logged_at: log.timestamp,
        })
        .eq('id', log.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurement_logs', petId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('measurement_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurement_logs', petId] });
    },
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateLog: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteLog: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
