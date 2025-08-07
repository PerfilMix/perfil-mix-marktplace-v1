-- Verificar se coluna chave_pix existe e adicionar se necessário
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'seller_requests' 
        AND column_name = 'chave_pix'
    ) THEN
        -- Adicionar coluna chave_pix na tabela seller_requests
        ALTER TABLE public.seller_requests 
        ADD COLUMN chave_pix TEXT;
        
        -- Adicionar comentário explicativo
        COMMENT ON COLUMN public.seller_requests.chave_pix IS 'Chave PIX do vendedor para recebimento dos valores das vendas';
    END IF;
END $$;