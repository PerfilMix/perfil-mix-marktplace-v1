-- Adicionar coluna monetizada à tabela accounts
ALTER TABLE public.accounts ADD COLUMN monetizada TEXT DEFAULT 'Não';

-- Adicionar constraint para garantir que só aceita 'Sim' ou 'Não'
ALTER TABLE public.accounts ADD CONSTRAINT check_monetizada CHECK (monetizada IN ('Sim', 'Não'));

-- Atualizar o comentário da coluna
COMMENT ON COLUMN public.accounts.monetizada IS 'Indica se a conta está monetizada (Sim/Não)';