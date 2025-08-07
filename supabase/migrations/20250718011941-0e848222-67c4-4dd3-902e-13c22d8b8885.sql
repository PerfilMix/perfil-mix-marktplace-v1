-- Criar tabela para colaboradores
CREATE TABLE public.collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  telefone TEXT,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Habilitar RLS
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para colaboradores
CREATE POLICY "Admins podem gerenciar colaboradores"
ON public.collaborators
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.is_admin = true
));

CREATE POLICY "Colaboradores podem ver seu próprio perfil"
ON public.collaborators
FOR SELECT
USING (email = auth.email());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_collaborators_updated_at
BEFORE UPDATE ON public.collaborators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();