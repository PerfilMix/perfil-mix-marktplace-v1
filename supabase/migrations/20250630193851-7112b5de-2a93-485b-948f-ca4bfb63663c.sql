
-- Adicionar coluna profile_image_url na tabela accounts
ALTER TABLE public.accounts 
ADD COLUMN profile_image_url TEXT;

-- Criar bucket para armazenar imagens de perfil das contas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'account-profiles',
  'account-profiles',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Criar política para permitir upload de imagens (público para leitura)
CREATE POLICY "Permitir leitura pública de imagens de perfil"
ON storage.objects FOR SELECT
USING (bucket_id = 'account-profiles');

-- Criar política para permitir upload apenas para usuários autenticados
CREATE POLICY "Permitir upload para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'account-profiles' AND auth.role() = 'authenticated');

-- Criar política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados"
ON storage.objects FOR UPDATE
USING (bucket_id = 'account-profiles' AND auth.role() = 'authenticated');

-- Criar política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados"
ON storage.objects FOR DELETE
USING (bucket_id = 'account-profiles' AND auth.role() = 'authenticated');
