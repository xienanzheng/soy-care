import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MealPreset } from '@/types/pet';

export function useMealPresets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['meal_presets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('meal_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((preset): MealPreset => ({
        id: preset.id,
        name: preset.name,
        defaultFoodName: preset.default_food_name,
        defaultMealType: (preset.default_meal_type as MealPreset['defaultMealType']) || undefined,
        defaultAmountGrams: preset.default_amount_grams ?? undefined,
        defaultCalories: preset.default_calories ?? undefined,
        defaultProteinPercent: preset.default_protein_percent ?? undefined,
        defaultFatPercent: preset.default_fat_percent ?? undefined,
        defaultCarbPercent: preset.default_carb_percent ?? undefined,
        notes: preset.notes ?? undefined,
        createdAt: preset.created_at,
      }));
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (preset: Omit<MealPreset, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_presets')
        .insert({
          user_id: user.id,
          name: preset.name,
          default_food_name: preset.defaultFoodName,
          default_meal_type: preset.defaultMealType || null,
          default_amount_grams: preset.defaultAmountGrams || null,
          default_calories: preset.defaultCalories || null,
          default_protein_percent: preset.defaultProteinPercent || null,
          default_fat_percent: preset.defaultFatPercent || null,
          default_carb_percent: preset.defaultCarbPercent || null,
          notes: preset.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal_presets', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (presetId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('meal_presets')
        .delete()
        .eq('id', presetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal_presets', user?.id] });
    },
  });

  return {
    presets: query.data ?? [],
    isLoading: query.isLoading,
    createPreset: createMutation.mutateAsync,
    isSavingPreset: createMutation.isPending,
    deletePreset: deleteMutation.mutateAsync,
    isDeletingPreset: deleteMutation.isPending,
  };
}
