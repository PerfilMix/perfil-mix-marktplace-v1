-- 1. Definir o usuário digitalmakers20@gmail.com como admin
UPDATE public.users 
SET is_admin = true 
WHERE email = 'digitalmakers20@gmail.com';

-- 2. Também definir juliobritoecommerce@gmail.com como admin (backup)
UPDATE public.users 
SET is_admin = true 
WHERE email = 'juliobritoecommerce@gmail.com';

-- 3. Verificar se as políticas RLS estão funcionando corretamente
-- As políticas já existem e estão corretas, só precisavam de usuários admin