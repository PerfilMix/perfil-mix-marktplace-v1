-- Atualizar FAQs com conteúdo relevante para o marketplace de contas
DELETE FROM help_center_faqs;

INSERT INTO help_center_faqs (question, answer, category, keywords, order_position, is_active) VALUES 
('Como comprar uma conta no marketplace?', 'Para comprar uma conta, navegue pelo catálogo na página inicial, clique na conta desejada e depois em "Comprar Agora". Você será direcionado para o checkout onde poderá inserir seus dados e efetuar o pagamento via PIX ou cartão de crédito.', 'Compras', ARRAY['comprar', 'checkout', 'pagamento', 'pix', 'cartão'], 1, true),

('Quais plataformas estão disponíveis para compra?', 'Oferecemos contas verificadas das seguintes plataformas: TikTok, Instagram, YouTube, Facebook, Kwai e lojas Shopify prontas. Cada conta possui informações detalhadas sobre seguidores, engajamento e nicho.', 'Produtos', ARRAY['plataformas', 'tiktok', 'instagram', 'youtube', 'facebook', 'kwai', 'shopify'], 2, true),

('Como funciona o pagamento?', 'Aceitamos pagamentos via PIX (aprovação instantânea) e cartão de crédito (processamento em alguns minutos). Após a confirmação do pagamento, você receberá automaticamente os dados de acesso da conta comprada em seu dashboard.', 'Pagamento', ARRAY['pagamento', 'pix', 'cartão', 'aprovação', 'dados'], 3, true),

('Onde encontro os dados das contas compradas?', 'Após a confirmação do pagamento, acesse seu dashboard em "Minha Conta" para visualizar todas as contas compradas, incluindo login, senha e informações detalhadas de cada perfil.', 'Dashboard', ARRAY['dashboard', 'conta', 'login', 'senha', 'dados'], 4, true),

('As contas são verificadas e seguras?', 'Sim, todas as contas passam por um processo de verificação antes de serem disponibilizadas no marketplace. Garantimos que são contas reais, ativas e com histórico limpo na plataforma correspondente.', 'Segurança', ARRAY['verificadas', 'seguras', 'reais', 'ativas', 'qualidade'], 5, true),

('Como funciona a entrega das contas?', 'A entrega é instantânea! Assim que seu pagamento for confirmado (PIX é imediato, cartão leva alguns minutos), os dados da conta ficam disponíveis em seu dashboard pessoal para acesso imediato.', 'Entrega', ARRAY['entrega', 'instantânea', 'dashboard', 'imediato', 'acesso'], 6, true),

('Posso filtrar contas por características específicas?', 'Sim! Você pode filtrar as contas por plataforma, nicho, número de seguidores, país de origem e outras características. Use os filtros na página principal para encontrar exatamente o que procura.', 'Busca', ARRAY['filtros', 'nicho', 'seguidores', 'país', 'características'], 7, true),

('O que fazer se tiver problemas com uma conta comprada?', 'Entre em contato conosco através do chat de suporte (botão no canto inferior direito) ou pela seção de ajuda. Nossa equipe de suporte está disponível para resolver qualquer questão relacionada às suas compras.', 'Suporte', ARRAY['suporte', 'chat', 'problemas', 'ajuda', 'atendimento'], 8, true),

('Preciso criar uma conta para comprar?', 'Sim, é necessário criar uma conta gratuita para efetuar compras. Isso permite que você acesse seu histórico de compras, dados das contas compradas e receba suporte personalizado.', 'Conta', ARRAY['cadastro', 'conta', 'registro', 'gratuito', 'login'], 9, true),

('Como funcionam as lojas Shopify?', 'As lojas Shopify são e-commerces completos e prontos para uso, incluindo produtos cadastrados, design profissional e configurações básicas. Algumas podem incluir domínio próprio e integrações ativas com fornecedores.', 'Shopify', ARRAY['shopify', 'loja', 'ecommerce', 'produtos', 'domínio'], 10, true);