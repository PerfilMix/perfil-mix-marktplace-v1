
-- Adicionar nova coluna tiktok_shop na tabela accounts
ALTER TABLE public.accounts 
ADD COLUMN tiktok_shop text NOT NULL DEFAULT 'Não';

-- Adicionar nova coluna nicho_customizado na tabela accounts
ALTER TABLE public.accounts 
ADD COLUMN nicho_customizado text;

-- Adicionar constraint para garantir que tiktok_shop só aceite 'Sim' ou 'Não'
ALTER TABLE public.accounts 
ADD CONSTRAINT check_tiktok_shop CHECK (tiktok_shop IN ('Sim', 'Não'));
