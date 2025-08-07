
-- 1. Remover a constraint atual de foreign key
ALTER TABLE public.accounts 
DROP CONSTRAINT IF EXISTS accounts_comprada_por_fkey;

-- 2. Criar nova constraint referenciando auth.users
ALTER TABLE public.accounts 
ADD CONSTRAINT accounts_comprada_por_fkey 
FOREIGN KEY (comprada_por) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Atualizar/criar função para sincronizar usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name, password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'auth_user' -- Senha placeholder para usuários criados via auth
  )
  ON CONFLICT (email) DO UPDATE SET
    id = NEW.id,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name);
  
  RETURN NEW;
END;
$function$;

-- 4. Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Inserir o usuário atual na tabela users (baseado no log de erro)
INSERT INTO public.users (id, email, name, password)
VALUES (
  '6b0ff84f-2523-43aa-971e-e2775887ac00',
  'usuario_atual@exemplo.com', -- Você pode atualizar este email depois
  'Usuário Atual',
  'auth_user'
)
ON CONFLICT (id) DO NOTHING;
