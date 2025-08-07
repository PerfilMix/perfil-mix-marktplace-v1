
-- Remove the moeda column from the accounts table since we're now using country-based pricing
ALTER TABLE public.accounts DROP COLUMN IF EXISTS moeda;
