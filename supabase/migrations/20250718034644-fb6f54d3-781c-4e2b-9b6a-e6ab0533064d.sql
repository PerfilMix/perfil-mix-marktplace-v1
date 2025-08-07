-- Remover dados de teste das solicitações de vendedores
DELETE FROM public.seller_requests 
WHERE nome_completo IN ('Julio Cesar de Brito Santos', 'Yago Castro Silva', 'Julio Brito Silva');