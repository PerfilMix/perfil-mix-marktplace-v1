-- Permitir que vendedores atualizem suas próprias contas
CREATE POLICY "Sellers can update their own accounts" 
ON public.accounts 
FOR UPDATE 
USING (auth.uid() = vendedor_id AND status IN ('disponivel_venda', 'em_producao'));