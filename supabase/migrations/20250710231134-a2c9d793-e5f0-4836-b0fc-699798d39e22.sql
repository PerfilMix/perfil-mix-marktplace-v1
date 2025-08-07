-- Adicionar campo telefone na tabela users
ALTER TABLE public.users 
ADD COLUMN telefone TEXT;

-- Atualizar a função que cria usuários para incluir telefone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name, telefone, password, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    'auth_user',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
    telefone = COALESCE(NEW.raw_user_meta_data->>'telefone', users.telefone);
  
  RETURN NEW;
END;
$function$;