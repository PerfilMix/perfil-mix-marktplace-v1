-- Remove a função get_current_tenant_id que está causando erro
DROP FUNCTION IF EXISTS public.get_current_tenant_id();

-- Remove todas as políticas RLS que usam tenant_id ou get_current_tenant_id
DROP POLICY IF EXISTS "Vendedores podem gerenciar suas contas do tenant" ON public.accounts;
DROP POLICY IF EXISTS "Vendedores podem ver contas de seu tenant" ON public.accounts;

-- Recria políticas RLS mais simples sem usar tenant_id
CREATE POLICY "Vendedores podem ver suas próprias contas" 
ON public.accounts 
FOR SELECT 
USING (vendedor_id = auth.uid());

CREATE POLICY "Vendedores podem inserir suas próprias contas" 
ON public.accounts 
FOR INSERT 
WITH CHECK (vendedor_id = auth.uid());

CREATE POLICY "Vendedores podem atualizar suas próprias contas" 
ON public.accounts 
FOR UPDATE 
USING (vendedor_id = auth.uid());

CREATE POLICY "Vendedores podem deletar suas próprias contas" 
ON public.accounts 
FOR DELETE 
USING (vendedor_id = auth.uid());