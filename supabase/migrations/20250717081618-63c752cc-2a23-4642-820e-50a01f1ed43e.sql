-- Criar usuário na tabela auth.users para permitir login
-- O usuário já existe na tabela users, agora precisamos criá-lo na auth.users

-- Primeiro, vamos verificar se o usuário já existe na auth.users
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Verificar se o usuário já existe na auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'perfilmix2025@gmail.com'
    ) INTO user_exists;
    
    -- Se não existir, criar o usuário
    IF NOT user_exists THEN
        -- Inserir na auth.users com senha hasheada
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
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
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'perfilmix2025@gmail.com',
            crypt('admin123', gen_salt('bf')), -- Senha: admin123
            now(),
            now(),
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
        
        RAISE NOTICE 'Usuário criado na auth.users com sucesso';
    ELSE
        RAISE NOTICE 'Usuário já existe na auth.users';
    END IF;
END $$;