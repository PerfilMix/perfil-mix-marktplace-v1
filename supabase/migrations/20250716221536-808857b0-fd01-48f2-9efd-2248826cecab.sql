-- Criar tabela para configurações de comissão dos vendedores
CREATE TABLE public.seller_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL UNIQUE,
  commission_percentage DECIMAL(4,2) NOT NULL DEFAULT 10.00 CHECK (commission_percentage >= 1.00 AND commission_percentage <= 15.00),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users(id)
);

-- Adicionar índice para melhor performance
CREATE INDEX idx_seller_commissions_seller_id ON public.seller_commissions(seller_id);

-- Habilitar RLS
ALTER TABLE public.seller_commissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para seller_commissions
CREATE POLICY "Admins podem gerenciar todas as comissões" 
ON public.seller_commissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

CREATE POLICY "Vendedores podem ver sua própria comissão" 
ON public.seller_commissions 
FOR SELECT 
USING (seller_id = auth.uid());

-- Adicionar coluna commission_at_sale na tabela transactions para registrar comissão no momento da venda
ALTER TABLE public.transactions 
ADD COLUMN commission_percentage DECIMAL(4,2) DEFAULT 10.00;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_seller_commissions_updated_at
BEFORE UPDATE ON public.seller_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para obter comissão do vendedor (com valor padrão 10%)
CREATE OR REPLACE FUNCTION public.get_seller_commission(seller_user_id UUID)
RETURNS DECIMAL(4,2)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT commission_percentage FROM public.seller_commissions WHERE seller_id = seller_user_id),
    10.00
  );
$$;