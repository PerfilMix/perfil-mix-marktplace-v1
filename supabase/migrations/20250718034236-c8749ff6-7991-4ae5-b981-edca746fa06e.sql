-- Inserir dados de teste na tabela seller_requests para verificar se o painel funciona
INSERT INTO public.seller_requests (
  user_id,
  status,
  nome_completo,
  cpf_cnpj,
  telefone,
  endereco_completo,
  message,
  termos_aceitos,
  created_at
) VALUES 
(
  '2b291a43-a1ae-4973-9b9c-f82f50fb2699', -- Yago Castro
  'pending',
  'Yago Castro Silva',
  '123.456.789-01',
  '(11) 99999-1234',
  'Rua das Flores, 123 - São Paulo, SP',
  'Gostaria de me tornar vendedor na plataforma para expandir meus negócios.',
  true,
  NOW() - INTERVAL '2 days'
),
(
  '572b9a88-5f83-4338-a243-41af5ed20e0c', -- Julio Cesar
  'pending', 
  'Julio Cesar de Brito Santos',
  '987.654.321-00',
  '(21) 98888-5678',
  'Avenida Central, 456 - Rio de Janeiro, RJ',
  'Tenho experiência em vendas digitais e quero me juntar como vendedor.',
  true,
  NOW() - INTERVAL '1 day'
),
(
  '4156cd5e-e51c-4f28-a457-2a6dc592932c', -- Julio Brito
  'approved',
  'Julio Brito Silva',
  '456.789.123-45',
  '(85) 97777-9999',
  'Rua do Comércio, 789 - Fortaleza, CE',
  'Solicito aprovação para vender contas na plataforma.',
  true,
  NOW() - INTERVAL '3 days'
);