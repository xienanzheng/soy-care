-- Ensure crypto helpers exist for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enrich pets table with metadata used throughout the app
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS medical_history TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS favorite_activities TEXT,
  ADD COLUMN IF NOT EXISTS personality TEXT;

-- Keep stool logs aligned with the UI fields
ALTER TABLE public.poop_logs
  ADD COLUMN IF NOT EXISTS blood_present BOOLEAN,
  ADD COLUMN IF NOT EXISTS mucus_present BOOLEAN,
  ADD COLUMN IF NOT EXISTS moisture_level TEXT,
  ADD COLUMN IF NOT EXISTS smell_level NUMERIC,
  ADD COLUMN IF NOT EXISTS user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 10);

-- Community posts surfaced in the feed
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  owner_name TEXT,
  content TEXT NOT NULL,
  photo_url TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Community posts are visible" ON public.community_posts
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users manage their community posts" ON public.community_posts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Care challenges
CREATE TABLE IF NOT EXISTS public.pet_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  progress NUMERIC NOT NULL DEFAULT 0,
  goal NUMERIC NOT NULL DEFAULT 1,
  streak_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Pet challenge access" ON public.pet_challenges
  USING (
    EXISTS (
      SELECT 1
      FROM public.pets p
      WHERE p.id = pet_challenges.pet_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.pets p
      WHERE p.id = pet_challenges.pet_id
        AND p.user_id = auth.uid()
    )
  );

-- Health notes created by the AI assistant
CREATE TABLE IF NOT EXISTS public.health_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  recommendations TEXT,
  risk_level TEXT,
  owner_message TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.health_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Pet owners read health notes" ON public.health_notes
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p WHERE p.id = health_notes.pet_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Pet owners insert health notes" ON public.health_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p WHERE p.id = health_notes.pet_id AND p.user_id = auth.uid()
    )
  );

-- AI stool insight chunks used for RAG
CREATE TABLE IF NOT EXISTS public.poop_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  summary TEXT,
  notes TEXT,
  risk_level TEXT,
  similarity_vector JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.poop_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Pet owners manage poop insights" ON public.poop_insights
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p WHERE p.id = poop_insights.pet_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p WHERE p.id = poop_insights.pet_id AND p.user_id = auth.uid()
    )
  );

-- Engagement + rewards ledger
CREATE TABLE IF NOT EXISTS public.user_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  consecutive_days INTEGER DEFAULT 0,
  last_checkin TIMESTAMPTZ,
  credits INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  last_entry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users manage their metrics" ON public.user_metrics
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER IF NOT EXISTS update_user_metrics_updated_at
  BEFORE UPDATE ON public.user_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users view their credit transactions" ON public.credit_transactions
  USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users insert their credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vet contact card
CREATE TABLE IF NOT EXISTS public.user_vet_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  vet_name TEXT,
  clinic TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_vet_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users manage their vet contact" ON public.user_vet_contacts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER IF NOT EXISTS update_user_vet_contacts_updated_at
  BEFORE UPDATE ON public.user_vet_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Optional staffed vets directory
CREATE TABLE IF NOT EXISTS public.vets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  bio TEXT,
  avatar_url TEXT,
  clinic TEXT,
  city TEXT,
  contact_email TEXT,
  is_online BOOLEAN DEFAULT false,
  rating NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Vets readable" ON public.vets FOR SELECT USING (true);

-- Vet chat threads + messages
CREATE TABLE IF NOT EXISTS public.vet_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  vet_id UUID REFERENCES public.vets(id) ON DELETE SET NULL,
  topic TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'closed')),
  credit_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vet_chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users manage their threads" ON public.vet_chat_threads
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER IF NOT EXISTS update_vet_chat_threads_updated_at
  BEFORE UPDATE ON public.vet_chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.vet_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.vet_chat_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'vet')),
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vet_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users read thread messages" ON public.vet_chat_messages
  USING (
    EXISTS (
      SELECT 1
      FROM public.vet_chat_threads t
      WHERE t.id = vet_chat_messages.thread_id
        AND t.user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users send thread messages" ON public.vet_chat_messages
  FOR INSERT WITH CHECK (
    sender_type = 'user' AND sender_id = auth.uid() AND
    EXISTS (
      SELECT 1
      FROM public.vet_chat_threads t
      WHERE t.id = vet_chat_messages.thread_id
        AND t.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.touch_vet_chat_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.vet_chat_threads
     SET last_message_at = now(),
         updated_at = now()
   WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_vet_chat_thread ON public.vet_chat_messages;
CREATE TRIGGER touch_vet_chat_thread
  AFTER INSERT ON public.vet_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_vet_chat_thread();

-- Reward utility functions ---------------------------------------------------

CREATE OR REPLACE FUNCTION public.reward_for_activity(
  activity_name TEXT,
  event_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS public.user_metrics
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  credit_delta INTEGER;
  metrics public.user_metrics;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  credit_delta := CASE activity_name
    WHEN 'food_log' THEN 2
    WHEN 'poop_log' THEN 3
    WHEN 'supplement_log' THEN 2
    WHEN 'measurement_log' THEN 2
    WHEN 'photo_upload' THEN 1
    ELSE 0
  END;

  IF credit_delta = 0 THEN
    RAISE EXCEPTION 'Unknown activity %', activity_name;
  END IF;

  INSERT INTO public.user_metrics (user_id, credits, total_entries, last_entry_at)
  VALUES (auth.uid(), credit_delta, 1, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    credits = public.user_metrics.credits + credit_delta,
    total_entries = public.user_metrics.total_entries + 1,
    last_entry_at = now(),
    updated_at = now()
  RETURNING * INTO metrics;

  INSERT INTO public.credit_transactions (user_id, delta, reason, metadata)
  VALUES (auth.uid(), credit_delta, activity_name, event_metadata);

  RETURN metrics;
END;
$$;

CREATE OR REPLACE FUNCTION public.reward_daily_checkin()
RETURNS public.user_metrics
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  last_check TIMESTAMPTZ;
  metrics public.user_metrics;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT last_checkin INTO last_check
  FROM public.user_metrics
  WHERE user_id = auth.uid();

  IF last_check::date = current_date THEN
    RAISE EXCEPTION 'Daily check-in already recorded';
  END IF;

  INSERT INTO public.user_metrics (user_id, consecutive_days, last_checkin, credits, updated_at)
  VALUES (auth.uid(), 1, now(), 5, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    consecutive_days = CASE
      WHEN public.user_metrics.last_checkin::date = current_date - INTERVAL '1 day'
        THEN public.user_metrics.consecutive_days + 1
      ELSE 1
    END,
    last_checkin = now(),
    credits = public.user_metrics.credits + 5,
    updated_at = now()
  RETURNING * INTO metrics;

  INSERT INTO public.credit_transactions (user_id, delta, reason, metadata)
  VALUES (auth.uid(), 5, 'daily_checkin', jsonb_build_object('streak_days', metrics.consecutive_days));

  RETURN metrics;
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_credits(
  spend_amount INTEGER,
  spend_reason TEXT,
  event_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS public.user_metrics
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  metrics public.user_metrics;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF spend_amount <= 0 THEN
    RAISE EXCEPTION 'Spend amount must be positive';
  END IF;

  INSERT INTO public.user_metrics (user_id, credits)
  VALUES (auth.uid(), 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_metrics
     SET credits = credits - spend_amount,
         updated_at = now()
   WHERE user_id = auth.uid()
     AND credits >= spend_amount
  RETURNING * INTO metrics;

  IF metrics IS NULL THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  INSERT INTO public.credit_transactions (user_id, delta, reason, metadata)
  VALUES (auth.uid(), -spend_amount, spend_reason, event_metadata);

  RETURN metrics;
END;
$$;
