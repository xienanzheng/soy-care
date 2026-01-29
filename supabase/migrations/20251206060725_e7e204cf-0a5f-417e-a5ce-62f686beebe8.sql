-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for log photos (food, poop, supplements)
INSERT INTO storage.buckets (id, name, public)
VALUES ('log-photos', 'log-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for pet-photos bucket
CREATE POLICY "Users can upload their own pet photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pet-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own pet photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pet-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own pet photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pet-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Pet photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-photos');

-- RLS policies for log-photos bucket
CREATE POLICY "Users can upload their own log photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'log-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own log photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'log-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own log photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'log-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Log photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'log-photos');