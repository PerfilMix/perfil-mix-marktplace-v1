-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    conta_id UUID NOT NULL,
    vendedor_id UUID,
    texto TEXT NOT NULL,
    imagem_url TEXT,
    usuario_telefone TEXT,
    vendedor_telefone TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'resolvida', 'rejeitada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_complaints_usuario FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_conta FOREIGN KEY (conta_id) REFERENCES public.accounts(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Policies for complaints
CREATE POLICY "Users can view their own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins can view all complaints" ON public.complaints
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE email = (auth.jwt() -> 'email')::text
        )
    );

CREATE POLICY "Admins can update complaint status" ON public.complaints
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE email = (auth.jwt() -> 'email')::text
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_complaints_usuario_id ON public.complaints(usuario_id);
CREATE INDEX idx_complaints_conta_id ON public.complaints(conta_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_complaints_updated_at();