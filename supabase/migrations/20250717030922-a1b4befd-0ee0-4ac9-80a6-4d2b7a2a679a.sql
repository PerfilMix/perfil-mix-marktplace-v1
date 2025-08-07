-- Atualizar a função get_seller_commission para retornar 10% como padrão
CREATE OR REPLACE FUNCTION public.get_seller_commission(seller_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT commission_percentage FROM public.seller_commissions WHERE seller_id = seller_user_id),
    10.00
  );
$$;

-- Atualizar todas as comissões existentes para 10% se estiverem em 5%
UPDATE public.seller_commissions 
SET commission_percentage = 10.00, updated_at = now() 
WHERE commission_percentage = 5.00;