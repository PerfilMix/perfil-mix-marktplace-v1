
-- Add new fields to the accounts table for Shopify stores
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS clientes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS descricao_loja text,
ADD COLUMN IF NOT EXISTS vendas_mensais text,
ADD COLUMN IF NOT EXISTS produtos_cadastrados integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS trafego_mensal text,
ADD COLUMN IF NOT EXISTS integracoes_ativas text,
ADD COLUMN IF NOT EXISTS dominio_incluso boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS loja_pronta boolean DEFAULT false;
