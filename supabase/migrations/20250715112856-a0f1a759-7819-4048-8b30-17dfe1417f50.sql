-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  texto TEXT NOT NULL,
  imagem_url TEXT,
  usuario_telefone TEXT,
  vendedor_telefone TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'resolvida', 'rejeitada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create policies for complaints access
CREATE POLICY "Users can view their own complaints" 
ON public.complaints 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins can manage all complaints" 
ON public.complaints 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.is_admin = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();