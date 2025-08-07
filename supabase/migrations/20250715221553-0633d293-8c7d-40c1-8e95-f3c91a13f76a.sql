-- Adicionar coluna para arquivar reclamações
ALTER TABLE public.complaints 
ADD COLUMN arquivada BOOLEAN DEFAULT false;

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_complaints_arquivada ON public.complaints(arquivada);
CREATE INDEX idx_complaints_status_arquivada ON public.complaints(status, arquivada);