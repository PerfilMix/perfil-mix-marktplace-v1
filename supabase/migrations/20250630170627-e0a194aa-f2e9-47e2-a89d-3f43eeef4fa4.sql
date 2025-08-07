
-- Add missing columns to banners table to support the banner system functionality
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'desktop',
ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Update the column names to match what the code expects
ALTER TABLE public.banners RENAME COLUMN active TO is_active;
ALTER TABLE public.banners RENAME COLUMN position TO order_position;
