-- Atualizar email do administrador principal do sistema
-- De: digitalmakers20@gmail.com
-- Para: perfilmix2025@gmail.com

-- 1. Primeiro, remover privilégios de admin do email antigo
UPDATE public.users 
SET is_admin = false 
WHERE email = 'digitalmakers20@gmail.com';

-- 2. Definir o novo email como administrador principal
UPDATE public.users 
SET is_admin = true 
WHERE email = 'perfilmix2025@gmail.com';

-- 3. Se o usuário novo não existir na tabela users, criar um registro
INSERT INTO public.users (id, email, name, password, is_admin)
SELECT 
    gen_random_uuid(),
    'perfilmix2025@gmail.com',
    'Administrador Principal',
    'admin_password',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'perfilmix2025@gmail.com'
);

-- 4. Criar/atualizar na tabela admins (se existir)
-- Primeiro verificar se a tabela existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins' AND table_schema = 'public') THEN
        -- Remover admin antigo
        DELETE FROM public.admins WHERE email = 'digitalmakers20@gmail.com';
        
        -- Adicionar novo admin
        INSERT INTO public.admins (email, password, name)
        VALUES ('perfilmix2025@gmail.com', 'admin123', 'Administrador Principal')
        ON CONFLICT (email) DO UPDATE SET
            password = 'admin123',
            name = 'Administrador Principal';
    END IF;
END $$;

-- 5. Manter juliobritoecommerce@gmail.com como admin backup
UPDATE public.users 
SET is_admin = true 
WHERE email = 'juliobritoecommerce@gmail.com';

-- 6. Verificar resultado
SELECT email, is_admin, name FROM public.users WHERE is_admin = true;