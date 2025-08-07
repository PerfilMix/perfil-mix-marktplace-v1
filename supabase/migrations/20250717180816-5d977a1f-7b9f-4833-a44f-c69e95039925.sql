-- Corrigir políticas RLS para usar o email correto do admin
-- Restaurar políticas para digitalmakers20@gmail.com que é o admin atual na tabela

-- Para a tabela admins
DROP POLICY IF EXISTS "Todas as Politicas" ON public.admins;
CREATE POLICY "Todas as Politicas" 
ON public.admins 
FOR ALL 
USING (auth.email() = 'digitalmakers20@gmail.com')
WITH CHECK (auth.email() = 'digitalmakers20@gmail.com');

-- Para a tabela site_settings
DROP POLICY IF EXISTS "Allow anyone to read site_settings" ON public.site_settings;
CREATE POLICY "Allow anyone to read site_settings" 
ON public.site_settings 
FOR SELECT 
USING (auth.email() = 'digitalmakers20@gmail.com');

DROP POLICY IF EXISTS "Allow anyone to update site_settings" ON public.site_settings;
CREATE POLICY "Allow anyone to update site_settings" 
ON public.site_settings 
FOR UPDATE 
USING (auth.email() = 'digitalmakers20@gmail.com');

-- Para a tabela subscribers
DROP POLICY IF EXISTS "Allow admins to view subscribers" ON public.subscribers;
CREATE POLICY "Allow admins to view subscribers" 
ON public.subscribers 
FOR SELECT 
USING (auth.email() = 'digitalmakers20@gmail.com');

DROP POLICY IF EXISTS "Allow public inserts to subscribers" ON public.subscribers;
CREATE POLICY "Allow public inserts to subscribers" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.email() = 'digitalmakers20@gmail.com');