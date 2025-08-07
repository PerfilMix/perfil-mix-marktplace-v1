-- Adicionar coluna para controlar se as vendas do vendedor estão bloqueadas
ALTER TABLE public.users ADD COLUMN seller_sales_blocked BOOLEAN DEFAULT FALSE;

-- Atualizar o comentário da coluna
COMMENT ON COLUMN public.users.seller_sales_blocked IS 'Indica se as vendas do vendedor estão bloqueadas pelo admin';