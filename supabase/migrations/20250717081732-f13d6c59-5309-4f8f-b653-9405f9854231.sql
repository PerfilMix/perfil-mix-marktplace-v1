-- Primeiro, vamos desabilitar temporariamente o trigger que causa conflito
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Agora vamos criar o usuário na auth.users
DO $$
DECLARE
    new_user_id UUID;
    user_exists BOOLEAN;
    user_id_from_users UUID;
BEGIN
    -- Verificar se o usuário já existe na auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'perfilmix2025@gmail.com'
    ) INTO user_exists;
    
    -- Se não existir na auth.users, criar
    IF NOT user_exists THEN
        -- Pegar o ID do usuário da tabela users para manter consistência
        SELECT id INTO user_id_from_users FROM public.users WHERE email = 'perfilmix2025@gmail.com';
        
        -- Se não tem ID na tabela users, usar um novo UUID
        IF user_id_from_users IS NULL THEN
            new_user_id := gen_random_uuid();
        ELSE
            new_user_id := user_id_from_users;
        END IF;
        
        -- Inserir na auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'perfilmix2025@gmail.com',
            crypt('admin123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Administrador Principal"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
        
        -- Atualizar a tabela users com o mesmo ID se necessário
        UPDATE public.users 
        SET id = new_user_id 
        WHERE email = 'perfilmix2025@gmail.com' AND id != new_user_id;
        
        RAISE NOTICE 'Usuário criado na auth.users com ID: %', new_user_id;
    ELSE
        RAISE NOTICE 'Usuário já existe na auth.users';
    END IF;
END $$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();