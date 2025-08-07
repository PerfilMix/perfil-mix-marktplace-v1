
-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true);

-- Create policy to allow public access to banner files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Allow authenticated users to insert banner files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete banner files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
