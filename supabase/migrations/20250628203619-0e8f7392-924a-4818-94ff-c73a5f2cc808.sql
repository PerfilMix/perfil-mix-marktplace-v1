
-- Atualizar tabela transactions para suporte ao Mercado Pago
ALTER TABLE public.transactions 
ADD COLUMN mercado_pago_payment_id TEXT,
ADD COLUMN mercado_pago_payment_method TEXT,
ADD COLUMN mercado_pago_payment_status TEXT,
ADD COLUMN mercado_pago_external_reference TEXT,
ADD COLUMN qr_code_base64 TEXT,
ADD COLUMN qr_code TEXT,
ADD COLUMN ticket_url TEXT;

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_transactions_mp_payment_id ON public.transactions(mercado_pago_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_mp_external_ref ON public.transactions(mercado_pago_external_reference);

-- Atualizar trigger para manter updated_at
CREATE OR REPLACE FUNCTION public.update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at_trigger') THEN
        CREATE TRIGGER update_transactions_updated_at_trigger
            BEFORE UPDATE ON public.transactions
            FOR EACH ROW EXECUTE FUNCTION public.update_transactions_updated_at();
    END IF;
END $$;
