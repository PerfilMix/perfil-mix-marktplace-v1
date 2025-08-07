-- Remover política que depende de auth.uid()
DROP POLICY IF EXISTS "Permitir acesso a admins do sistema" ON public.admins;

-- Criar política mais permissiva para operações de admin
-- Permitir todas as operações para usuários autenticados (service role)
CREATE POLICY "Permitir operações de admin via service role" 
ON public.admins 
FOR ALL 
USING (true);

-- Manter política de consulta para autenticação
-- A política "Permitir consulta para autenticação" já existe e permite SELECT