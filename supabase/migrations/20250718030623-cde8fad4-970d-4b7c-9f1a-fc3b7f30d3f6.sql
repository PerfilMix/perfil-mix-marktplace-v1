-- Primeiro, vamos remover as políticas problemáticas da tabela accounts
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can delete accounts" ON public.accounts;

-- Criar função security definer para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE((
    SELECT is_admin 
    FROM public.users 
    WHERE id = auth.uid()
  ), false);
$$;

-- Recriar as políticas usando a função security definer
CREATE POLICY "Admins can view all accounts" 
ON public.accounts 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update accounts" 
ON public.accounts 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete accounts" 
ON public.accounts 
FOR DELETE 
USING (public.is_admin());