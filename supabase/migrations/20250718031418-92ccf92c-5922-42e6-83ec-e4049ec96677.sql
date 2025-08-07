-- Criar trigger para inserção automática de usuários
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar e corrigir políticas problemáticas na tabela site_settings
-- Remover políticas duplicadas/conflitantes
DROP POLICY IF EXISTS "Allow anyone to delete from site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow anyone to insert into site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow anyone to read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow anyone to update site_settings" ON public.site_settings;

-- Manter apenas políticas consistentes para site_settings
-- As políticas para admins já existem e são suficientes

-- Verificar se RLS está habilitado nas tabelas principais
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;