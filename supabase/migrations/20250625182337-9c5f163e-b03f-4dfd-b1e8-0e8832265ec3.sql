
-- Remove o usuário específico "usuario_atual@exemplo.com" da tabela users
DELETE FROM public.users 
WHERE email = 'usuario_atual@exemplo.com' 
AND id = '6b0ff84f-2523-43aa-971e-e2775887ac00';
