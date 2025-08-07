-- Criar tabela para as FAQs da central de ajuda
CREATE TABLE public.help_center_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para as mensagens do chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para o status do chat
CREATE TABLE public.chat_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  auto_response_enabled BOOLEAN DEFAULT true,
  auto_response_message TEXT DEFAULT 'Obrigado por entrar em contato! Nossa equipe responderá em breve.'
);

-- Inserir status inicial
INSERT INTO public.chat_status (is_online, auto_response_enabled) VALUES (true, true);

-- Habilitar RLS nas tabelas
ALTER TABLE public.help_center_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_status ENABLE ROW LEVEL SECURITY;

-- Políticas para help_center_faqs
CREATE POLICY "Qualquer um pode visualizar FAQs ativas" 
ON public.help_center_faqs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins podem gerenciar FAQs" 
ON public.help_center_faqs 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

-- Políticas para chat_messages
CREATE POLICY "Usuários podem ver suas próprias mensagens" 
ON public.chat_messages 
FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Usuários podem enviar mensagens" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins podem enviar mensagens" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins podem atualizar mensagens" 
ON public.chat_messages 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

-- Políticas para chat_status
CREATE POLICY "Qualquer um pode visualizar status" 
ON public.chat_status 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem atualizar status" 
ON public.chat_status 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

-- Inserir FAQs iniciais
INSERT INTO public.help_center_faqs (question, answer, category, keywords, order_position) VALUES
('Como gerenciar meus eventos na Agenda Pro?', 'Na Agenda Pro você pode criar, editar e excluir eventos facilmente. Acesse a seção "Meus Eventos" no painel principal e utilize as opções disponíveis para gerenciar sua agenda de forma completa.', 'Agenda Pro', '{"agenda", "eventos", "gerenciar", "criar", "editar"}', 1),
('Como funciona o sistema de assinaturas?', 'Nosso sistema de assinaturas oferece diferentes planos com benefícios exclusivos. Você pode escolher entre planos mensais e anuais, com renovação automática e possibilidade de cancelamento a qualquer momento.', 'Assinaturas', '{"assinatura", "planos", "renovação", "cancelamento", "pagamento"}', 2),
('Como solicitar acesso ao Canva Pro?', 'Para solicitar acesso ao Canva Pro, vá até a seção "Benefícios" em seu painel e clique em "Solicitar Canva Pro". Nossa equipe processará sua solicitação em até 24 horas úteis.', 'Canva Pro', '{"canva", "pro", "solicitar", "acesso", "benefícios"}', 3),
('Como funciona o sistema de Afiliados?', 'Nosso programa de afiliados permite que você ganhe comissões indicando novos usuários. Você recebe um link exclusivo e ganha uma porcentagem de cada venda realizada através da sua indicação.', 'Afiliados', '{"afiliados", "comissões", "indicação", "link", "ganhar"}', 4),
('Como acompanhar minhas indicações e ganhos?', 'No painel de afiliados você pode visualizar todas suas indicações, conversões e ganhos em tempo real. Acesse a aba "Relatórios" para ver estatísticas detalhadas do seu desempenho.', 'Afiliados', '{"indicações", "ganhos", "relatórios", "estatísticas", "desempenho"}', 5),
('Quando recebo o pagamento das comissões?', 'Os pagamentos das comissões são processados mensalmente, todo dia 15. O valor mínimo para saque é de R$ 50,00 e o pagamento é feito via PIX ou transferência bancária.', 'Afiliados', '{"pagamento", "comissões", "saque", "pix", "transferência"}', 6);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_help_center_faqs_updated_at
    BEFORE UPDATE ON public.help_center_faqs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();