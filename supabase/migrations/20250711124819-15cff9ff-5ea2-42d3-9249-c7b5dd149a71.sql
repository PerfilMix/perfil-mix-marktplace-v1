-- Criar tabela de avaliações de vendedores
CREATE TABLE public.seller_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_id) -- Garante que cada usuário só pode avaliar uma vez por conta comprada
);

-- Habilitar RLS
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias avaliações
CREATE POLICY "Users can view their own ratings" 
ON public.seller_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários criarem avaliações de contas que compraram
CREATE POLICY "Users can rate accounts they purchased" 
ON public.seller_ratings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.accounts 
    WHERE id = account_id 
    AND comprada_por = auth.uid()
    AND status = 'vendido'
  )
);

-- Política para vendedores e admins verem avaliações de suas contas
CREATE POLICY "Sellers and admins can view ratings for their accounts" 
ON public.seller_ratings 
FOR SELECT 
USING (
  seller_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND is_admin = true
  )
);

-- Função para calcular a média de avaliações de um vendedor
CREATE OR REPLACE FUNCTION public.get_seller_average_rating(seller_user_id UUID)
RETURNS DECIMAL(3,2)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(AVG(rating::decimal), 5.0)
  FROM public.seller_ratings
  WHERE seller_id = seller_user_id;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_seller_ratings_updated_at
  BEFORE UPDATE ON public.seller_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();