-- Expandir tabela seller_requests para incluir novos campos de verificação
ALTER TABLE public.seller_requests 
ADD COLUMN nome_completo TEXT,
ADD COLUMN cpf_cnpj TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN endereco_completo TEXT,
ADD COLUMN documento_foto_url TEXT,
ADD COLUMN selfie_documento_url TEXT,
ADD COLUMN termos_aceitos BOOLEAN DEFAULT false,
ADD COLUMN data_envio_documentos TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_observacoes TEXT;

-- Criar bucket para armazenamento de documentos de vendedores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seller-documents', 
  'seller-documents', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
);

-- Políticas para o bucket seller-documents
-- Vendedores podem fazer upload de seus próprios documentos
CREATE POLICY "Vendedores podem fazer upload de documentos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'seller-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Vendedores podem visualizar seus próprios documentos
CREATE POLICY "Vendedores podem ver seus documentos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'seller-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins podem visualizar todos os documentos
CREATE POLICY "Admins podem ver todos os documentos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'seller-documents'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Função para validar CPF/CNPJ (básica)
CREATE OR REPLACE FUNCTION public.validate_cpf_cnpj(doc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remove caracteres especiais
  doc := regexp_replace(doc, '[^0-9]', '', 'g');
  
  -- Verifica se tem 11 dígitos (CPF) ou 14 dígitos (CNPJ)
  IF length(doc) = 11 OR length(doc) = 14 THEN
    -- Verifica se não são todos os dígitos iguais
    IF doc !~ '^(\d)\1*$' THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$;

-- Função para atualizar timestamp de documentos
CREATE OR REPLACE FUNCTION public.update_seller_documents_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.documento_foto_url IS NOT NULL AND OLD.documento_foto_url IS NULL) 
     OR (NEW.selfie_documento_url IS NOT NULL AND OLD.selfie_documento_url IS NULL) THEN
    NEW.data_envio_documentos = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para atualizar automaticamente data_envio_documentos
CREATE TRIGGER trigger_update_documents_timestamp
  BEFORE UPDATE ON public.seller_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seller_documents_timestamp();