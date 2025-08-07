
-- Criar tabela para dados do checkout
CREATE TABLE public.checkout_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  email_confirmacao TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.checkout_data ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view their own checkout data" 
  ON public.checkout_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários inserirem seus próprios dados
CREATE POLICY "Users can insert their own checkout data" 
  ON public.checkout_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "Users can update their own checkout data" 
  ON public.checkout_data 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_checkout_data_updated_at 
  BEFORE UPDATE ON public.checkout_data 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
