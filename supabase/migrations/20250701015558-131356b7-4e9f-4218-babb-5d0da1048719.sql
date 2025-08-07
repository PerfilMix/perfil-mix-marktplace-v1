
-- Add support for 'dashboard' banner type
-- This migration updates the banner type check constraint to include the new 'dashboard' type

ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_type_check;
ALTER TABLE banners ADD CONSTRAINT banners_type_check 
  CHECK (type IN ('desktop', 'mobile', 'dashboard'));

-- Add a comment to document the new banner type
COMMENT ON COLUMN banners.type IS 'Banner type: desktop (homepage desktop), mobile (homepage mobile), dashboard (user dashboard vertical)';
