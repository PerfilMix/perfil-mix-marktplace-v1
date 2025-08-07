-- Remover políticas existentes que estão causando conflito
DROP POLICY IF EXISTS "Apenas admin logado pode modificar" ON public.admins;
DROP POLICY IF EXISTS "Permitir consultas para verificação de credenciais" ON public.admins;
DROP POLICY IF EXISTS "Permitir login de admin" ON public.admins;

-- Criar nova política que permite operações quando o usuário é um admin do sistema
-- usando a função is_system_admin() que já existe
CREATE POLICY "Permitir acesso a admins do sistema" 
ON public.admins 
FOR ALL 
USING (is_system_admin());

-- Política adicional para permitir consultas durante o processo de login
CREATE POLICY "Permitir consulta para autenticação" 
ON public.admins 
FOR SELECT 
USING (true);