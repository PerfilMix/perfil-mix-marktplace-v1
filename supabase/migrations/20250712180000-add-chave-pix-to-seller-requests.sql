-- Adicionar coluna chave_pix na tabela seller_requests
ALTER TABLE public.seller_requests 
ADD COLUMN chave_pix TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.seller_requests.chave_pix IS 'Chave PIX do vendedor para recebimento dos valores das vendas';