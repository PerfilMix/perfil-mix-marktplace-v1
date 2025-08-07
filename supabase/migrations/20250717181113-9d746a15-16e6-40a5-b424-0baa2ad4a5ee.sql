-- Verificar e ajustar as políticas RLS para permitir login
-- Remover temporariamente todas as políticas restritivas da tabela admins para teste

DROP POLICY IF EXISTS "Apenas admin pode modificar" ON public.admins;
DROP POLICY IF EXISTS "Todas as Politicas" ON public.admins;

-- Criar política permissiva para permitir consultas de login
CREATE POLICY "Permitir login de admin" 
ON public.admins 
FOR SELECT 
USING (true);

-- Política restritiva apenas para modificações
CREATE POLICY "Apenas admin logado pode modificar" 
ON public.admins 
FOR ALL 
USING (auth.email() = email)
WITH CHECK (auth.email() = email);