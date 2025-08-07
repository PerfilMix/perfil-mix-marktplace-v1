
-- Primeiro, vamos identificar e limpar os dados duplicados na tabela users
-- Manter apenas o registro mais recente para cada email
WITH duplicates AS (
  SELECT id, email, 
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM users
)
DELETE FROM users 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verificar se há registros na tabela users que não correspondem a usuários reais no auth.users
-- e remover esses registros órfãos se necessário
DELETE FROM users 
WHERE id NOT IN (
  SELECT id FROM auth.users
);

-- Atualizar o trigger para garantir sincronização correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name, password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'auth_user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name);
  
  RETURN NEW;
END;
$function$;
