-- Add user_rating column to poop_logs table for user's subjective poop rating (1-10)
ALTER TABLE public.poop_logs 
ADD COLUMN user_rating integer CHECK (user_rating >= 1 AND user_rating <= 10);