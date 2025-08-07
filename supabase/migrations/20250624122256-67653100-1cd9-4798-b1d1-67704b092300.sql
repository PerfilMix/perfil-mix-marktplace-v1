
-- Remove todos os objetos do bucket 'banners' primeiro
DELETE FROM storage.objects WHERE bucket_id = 'banners';

-- Agora pode remover o bucket 'banners'
DELETE FROM storage.buckets WHERE id = 'banners';

-- Remove todos os registros de banners da tabela site_settings
DELETE FROM site_settings WHERE type = 'banner';

-- Remove configurações de banner_settings se existirem
DELETE FROM site_settings WHERE type = 'banner_settings';
