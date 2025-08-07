-- Remove a coluna tenant_id de todas as tabelas que a possuem
ALTER TABLE public.accounts DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.seller_commissions DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.help_center_faqs DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.complaints DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.transactions DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.seller_requests DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.banners DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.withdrawal_requests DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.seller_ratings DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.users DROP COLUMN IF EXISTS tenant_id;