-- Track undesirable behaviors alongside stool logs
ALTER TABLE public.poop_logs
  ADD COLUMN IF NOT EXISTS undesirable_behaviors TEXT[],
  ADD COLUMN IF NOT EXISTS undesirable_behavior_notes TEXT;

-- Allow users to store reusable meal presets
CREATE TABLE IF NOT EXISTS public.meal_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_food_name TEXT NOT NULL,
  default_meal_type TEXT,
  default_amount_grams INTEGER,
  default_calories INTEGER,
  default_protein_percent INTEGER,
  default_fat_percent INTEGER,
  default_carb_percent INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Meal presets are readable" ON public.meal_presets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Meal presets are manageable" ON public.meal_presets
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
