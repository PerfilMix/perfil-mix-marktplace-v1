-- Criar tabela para administradores independente dos usuários
CREATE TABLE public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Administrador',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas (apenas admins podem acessar)
CREATE POLICY "Admins can view own data" ON public.admins
    FOR SELECT USING (true);

CREATE POLICY "Admins can update own data" ON public.admins
    FOR UPDATE USING (true);

-- Inserir os administradores
INSERT INTO public.admins (email, password, name) VALUES 
    ('perfilmix2025@gmail.com', 'admin123', 'Administrador Principal'),
    ('juliobritoecommerce@gmail.com', 'admin123', 'Administrador Backup')
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name;

-- Criar índices para performance
CREATE INDEX idx_admins_email ON public.admins(email);
CREATE INDEX idx_admins_is_active ON public.admins(is_active);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION update_admins_updated_at();