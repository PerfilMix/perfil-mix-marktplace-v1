-- Remove as políticas RLS que dependem da função get_current_tenant_id
DROP POLICY IF EXISTS "Vendedores podem gerenciar suas contas do tenant" ON public.accounts;
DROP POLICY IF EXISTS "Vendedores podem ver contas de seu tenant" ON public.accounts;

-- Agora remove a função get_current_tenant_id 
DROP FUNCTION IF EXISTS public.get_current_tenant_id();

-- Verifica se há políticas duplicadas e as remove se existirem
DROP POLICY IF EXISTS "Vendedores podem ver suas próprias contas" ON public.accounts;
DROP POLICY IF EXISTS "Vendedores podem inserir suas próprias contas" ON public.accounts;
DROP POLICY IF EXISTS "Vendedores podem atualizar suas próprias contas" ON public.accounts;
DROP POLICY IF EXISTS "Vendedores podem deletar suas próprias contas" ON public.accounts;