
-- Primeiro, vamos alinhar os IDs entre auth.users e public.users
-- Atualizar a tabela public.users para usar os IDs corretos de auth.users
UPDATE public.users 
SET id = (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = public.users.email
)
WHERE EXISTS (
  SELECT 1 
  FROM auth.users au 
  WHERE au.email = public.users.email
);

-- Atualizar a tabela accounts para usar os IDs corretos de auth.users
UPDATE public.accounts 
SET comprada_por = (
  SELECT au.id 
  FROM auth.users au 
  JOIN public.users pu ON au.email = pu.email
  WHERE pu.id = public.accounts.comprada_por
)
WHERE comprada_por IS NOT NULL
AND EXISTS (
  SELECT 1 
  FROM auth.users au 
  JOIN public.users pu ON au.email = pu.email
  WHERE pu.id = public.accounts.comprada_por
);

-- Criar função para sincronizar automaticamente novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, password, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'auth_user',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name);
  
  RETURN NEW;
END;
$$;

-- Criar trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar trigger para updates também
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
