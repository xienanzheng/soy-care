-- Vaccination records per pet
CREATE TABLE IF NOT EXISTS public.pet_vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  date_administered DATE NOT NULL,
  next_due DATE,
  vet_name TEXT,
  clinic TEXT,
  lot_number TEXT,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet vaccinations readable" ON public.pet_vaccinations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pet vaccinations insert" ON public.pet_vaccinations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pet vaccinations update" ON public.pet_vaccinations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Pet vaccinations delete" ON public.pet_vaccinations
  FOR DELETE USING (auth.uid() = user_id);

-- Health certificate storage
CREATE TABLE IF NOT EXISTS public.pet_health_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issued_at DATE NOT NULL,
  expires_at DATE,
  vet_name TEXT,
  clinic TEXT,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_health_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet certificates readable" ON public.pet_health_certificates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pet certificates insert" ON public.pet_health_certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pet certificates update" ON public.pet_health_certificates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Pet certificates delete" ON public.pet_health_certificates
  FOR DELETE USING (auth.uid() = user_id);
