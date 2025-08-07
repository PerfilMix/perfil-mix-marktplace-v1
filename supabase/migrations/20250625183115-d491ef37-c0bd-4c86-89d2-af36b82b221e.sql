
-- 1. Resetar a conta que estava vinculada ao usuário deletado
UPDATE public.accounts 
SET comprada_por = NULL, status = 'disponível' 
WHERE comprada_por = '6b0ff84f-2523-43aa-971e-e2775887ac00';

-- 2. Verificar e limpar qualquer outro registro órfão na tabela accounts
UPDATE public.accounts 
SET comprada_por = NULL, status = 'disponível' 
WHERE comprada_por IS NOT NULL 
AND comprada_por NOT IN (SELECT id FROM auth.users);
