-- Criar políticas para permitir que administradores vejam documentos de vendedores

-- Política para administradores visualizarem documentos
CREATE POLICY "Administradores podem visualizar documentos de vendedores" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'seller-documents' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- Política para vendedores visualizarem seus próprios documentos
CREATE POLICY "Vendedores podem visualizar seus próprios documentos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'seller-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);