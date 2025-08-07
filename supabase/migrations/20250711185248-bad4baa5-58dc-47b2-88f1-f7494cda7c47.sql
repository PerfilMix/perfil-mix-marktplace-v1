-- Criar tabela para solicitações de saque
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE NULL,
  reviewed_by UUID NULL REFERENCES auth.users(id),
  admin_notes TEXT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Vendedores podem ver suas próprias solicitações" 
ON public.withdrawal_requests 
FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Vendedores podem criar suas próprias solicitações" 
ON public.withdrawal_requests 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins podem ver todas as solicitações" 
ON public.withdrawal_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.is_admin = true
));

CREATE POLICY "Admins podem atualizar solicitações" 
ON public.withdrawal_requests 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_withdrawal_requests_seller_id ON public.withdrawal_requests(seller_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_requested_at ON public.withdrawal_requests(requested_at DESC);