
-- Adicionar campo vendedor_id na tabela accounts para associar contas aos vendedores
ALTER TABLE public.accounts 
ADD COLUMN vendedor_id uuid REFERENCES public.users(id);

-- Criar índice para melhor performance nas consultas por vendedor
CREATE INDEX idx_accounts_vendedor_id ON public.accounts(vendedor_id);

-- Adicionar políticas RLS para vendedores poderem ver e gerenciar suas próprias contas
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
