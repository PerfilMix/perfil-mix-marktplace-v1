-- Criar políticas RLS para a tabela users
-- Permitir que usuários vejam seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Permitir inserção de novos usuários (para registro)
CREATE POLICY "Allow user registration" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Permitir que admins vejam todos os usuários
CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Permitir que admins atualizem qualquer usuário
CREATE POLICY "Admins can update any user" 
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Permitir que admins insiram usuários
CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Permitir que admins deletem usuários (exceto eles mesmos)
CREATE POLICY "Admins can delete users except themselves" 
ON public.users 
FOR DELETE 
USING (
  auth.uid() != id AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);