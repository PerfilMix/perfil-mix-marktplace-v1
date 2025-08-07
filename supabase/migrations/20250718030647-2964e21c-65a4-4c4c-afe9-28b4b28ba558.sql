-- Remover políticas problemáticas da tabela users que causam recursão
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users except themselves" ON public.users;

-- Criar função para verificar admin sem recursão (usando session)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

-- Recriar políticas usando a função separada
CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (public.current_user_is_admin());

CREATE POLICY "Admins can update any user" 
ON public.users 
FOR UPDATE 
USING (public.current_user_is_admin());

CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admins can delete users except themselves" 
ON public.users 
FOR DELETE 
USING (
  public.current_user_is_admin() AND auth.uid() != id
);