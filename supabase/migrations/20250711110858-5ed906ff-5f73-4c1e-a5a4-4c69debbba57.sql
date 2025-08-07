-- Criar tabela para solicitações de vendas
CREATE TABLE public.seller_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.seller_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários verem suas próprias solicitações
CREATE POLICY "Users can view their own seller requests" 
ON public.seller_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas para usuários criarem suas próprias solicitações
CREATE POLICY "Users can create their own seller requests" 
ON public.seller_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para admins gerenciarem todas as solicitações
CREATE POLICY "Admins can manage all seller requests" 
ON public.seller_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Adicionar campo is_approved_seller na tabela users
ALTER TABLE public.users 
ADD COLUMN is_approved_seller BOOLEAN DEFAULT false;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_seller_requests_updated_at
BEFORE UPDATE ON public.seller_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();