-- Corrigir políticas RLS para o sistema de admin funcionar corretamente

-- 1. Atualizar função is_admin para corrigir problemas de busca
DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
  SELECT COALESCE((
    SELECT is_admin 
    FROM public.users 
    WHERE id = auth.uid()
  ), false);
$$;

-- 2. Atualizar função current_user_is_admin para corrigir problemas de busca
DROP FUNCTION IF EXISTS public.current_user_is_admin();
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

-- 3. Criar função para verificar admin usando a tabela admins
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE email = auth.email()
  );
$$;

-- 4. Atualizar políticas da tabela users para permitir acesso do admin
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users except themselves" ON public.users;

CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (public.is_system_admin() OR public.current_user_is_admin());

CREATE POLICY "Admins can update any user" 
ON public.users 
FOR UPDATE 
USING (public.is_system_admin() OR public.current_user_is_admin());

CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (public.is_system_admin() OR public.current_user_is_admin());

CREATE POLICY "Admins can delete users except themselves" 
ON public.users 
FOR DELETE 
USING (
  (public.is_system_admin() OR public.current_user_is_admin()) 
  AND auth.uid() != id
);

-- 5. Atualizar políticas da tabela accounts para permitir acesso do admin
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can delete accounts" ON public.accounts;

CREATE POLICY "Admins can view all accounts" 
ON public.accounts 
FOR SELECT 
USING (public.is_system_admin() OR public.is_admin());

CREATE POLICY "Admins can insert accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (public.is_system_admin() OR public.is_admin());

CREATE POLICY "Admins can update accounts" 
ON public.accounts 
FOR UPDATE 
USING (public.is_system_admin() OR public.is_admin());

CREATE POLICY "Admins can delete accounts" 
ON public.accounts 
FOR DELETE 
USING (public.is_system_admin() OR public.is_admin());

-- 6. Atualizar políticas da tabela seller_requests para permitir acesso do admin
DROP POLICY IF EXISTS "Admins can manage all seller requests" ON public.seller_requests;

CREATE POLICY "Admins can manage all seller requests" 
ON public.seller_requests 
FOR ALL 
USING (public.is_system_admin() OR public.current_user_is_admin());

-- 7. Atualizar políticas da tabela withdrawal_requests para permitir acesso do admin
DROP POLICY IF EXISTS "Admins podem ver todas as solicitações" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins podem atualizar solicitações" ON public.withdrawal_requests;

CREATE POLICY "Admins podem ver todas as solicitações" 
ON public.withdrawal_requests 
FOR SELECT 
USING (public.is_system_admin() OR public.current_user_is_admin());

CREATE POLICY "Admins podem atualizar solicitações" 
ON public.withdrawal_requests 
FOR UPDATE 
USING (public.is_system_admin() OR public.current_user_is_admin());

-- 8. Atualizar políticas da tabela complaints para permitir acesso do admin
DROP POLICY IF EXISTS "Admins can manage all complaints" ON public.complaints;

CREATE POLICY "Admins can manage all complaints" 
ON public.complaints 
FOR ALL 
USING (public.is_system_admin() OR public.current_user_is_admin());

-- 9. Atualizar políticas da tabela seller_commissions para permitir acesso do admin
DROP POLICY IF EXISTS "Admins podem gerenciar todas as comissões" ON public.seller_commissions;

CREATE POLICY "Admins podem gerenciar todas as comissões" 
ON public.seller_commissions 
FOR ALL 
USING (public.is_system_admin() OR public.current_user_is_admin());

-- 10. Atualizar políticas da tabela site_settings para permitir acesso do admin
DROP POLICY IF EXISTS "Admins can view all settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.site_settings;

CREATE POLICY "Admins can view all settings" 
ON public.site_settings 
FOR SELECT 
USING (public.is_system_admin() OR public.current_user_is_admin());

CREATE POLICY "Admins can insert settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (public.is_system_admin() OR public.current_user_is_admin());

CREATE POLICY "Admins can update settings" 
ON public.site_settings 
FOR UPDATE 
USING (public.is_system_admin() OR public.current_user_is_admin());

CREATE POLICY "Admins can delete settings" 
ON public.site_settings 
FOR DELETE 
USING (public.is_system_admin() OR public.current_user_is_admin());