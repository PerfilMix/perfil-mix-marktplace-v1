-- Atualizar email do administrador principal do sistema
-- De: digitalmakers20@gmail.com Para: perfilmix2025@gmail.com

-- 1. Primeiro, remover privilégios de admin do email antigo
UPDATE public.users 
SET is_admin = false 
WHERE email = 'digitalmakers20@gmail.com';

-- 2. Definir o novo email como administrador principal
UPDATE public.users 
SET is_admin = true 
WHERE email = 'perfilmix2025@gmail.com';

-- 3. Se o usuário novo não existir na tabela users, criar um registro
INSERT INTO public.users (id, email, name, password, is_admin, created_at)
SELECT 
    gen_random_uuid(),
    'perfilmix2025@gmail.com',
    'Administrador Principal',
    'admin123',
    true,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'perfilmix2025@gmail.com'
);

-- 4. Criar/atualizar na tabela admins
-- Remover admin antigo
DELETE FROM public.admins WHERE email = 'digitalmakers20@gmail.com';

-- Adicionar novo admin
INSERT INTO public.admins (email, password)
VALUES ('perfilmix2025@gmail.com', 'admin123')
ON CONFLICT (email) DO UPDATE SET
    password = 'admin123';

-- 5. Atualizar políticas RLS que fazem referência ao email específico
-- Verificar se existem políticas que fazem referência ao email antigo

-- Para a tabela admins
DROP POLICY IF EXISTS "Todas as Politicas" ON public.admins;
CREATE POLICY "Todas as Politicas" 
ON public.admins 
FOR ALL 
USING (auth.email() = 'perfilmix2025@gmail.com')
WITH CHECK (auth.email() = 'perfilmix2025@gmail.com');

-- Para a tabela site_settings
DROP POLICY IF EXISTS "Allow anyone to read site_settings" ON public.site_settings;
CREATE POLICY "Allow anyone to read site_settings" 
ON public.site_settings 
FOR SELECT 
USING (auth.email() = 'perfilmix2025@gmail.com');

DROP POLICY IF EXISTS "Allow anyone to update site_settings" ON public.site_settings;
CREATE POLICY "Allow anyone to update site_settings" 
ON public.site_settings 
FOR UPDATE 
USING (auth.email() = 'perfilmix2025@gmail.com');

-- Para a tabela subscribers
DROP POLICY IF EXISTS "Allow admins to view subscribers" ON public.subscribers;
CREATE POLICY "Allow admins to view subscribers" 
ON public.subscribers 
FOR SELECT 
USING (auth.email() = 'perfilmix2025@gmail.com');

DROP POLICY IF EXISTS "Allow public inserts to subscribers" ON public.subscribers;
CREATE POLICY "Allow public inserts to subscribers" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.email() = 'perfilmix2025@gmail.com');