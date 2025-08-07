-- Criar tabela para solicitações de saque dos vendedores
CREATE TABLE withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Índices para melhor performance
    CONSTRAINT withdrawal_requests_seller_id_idx UNIQUE (seller_id, created_at),
    INDEX idx_withdrawal_requests_seller_id ON withdrawal_requests(seller_id),
    INDEX idx_withdrawal_requests_status ON withdrawal_requests(status),
    INDEX idx_withdrawal_requests_created_at ON withdrawal_requests(created_at)
);

-- Habilitar RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Política para vendedores verem apenas suas próprias solicitações
CREATE POLICY "Sellers can view own withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (auth.uid() = seller_id);

-- Política para vendedores criarem suas próprias solicitações
CREATE POLICY "Sellers can create own withdrawal requests" ON withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Política para admins verem todas as solicitações
CREATE POLICY "Admins can view all withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Política para admins atualizarem solicitações
CREATE POLICY "Admins can update withdrawal requests" ON withdrawal_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Criar função para calcular saldo disponível do vendedor
CREATE OR REPLACE FUNCTION get_seller_available_balance(seller_user_id UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_earnings DECIMAL(10,2) := 0;
    approved_withdrawals DECIMAL(10,2) := 0;
    available_balance DECIMAL(10,2) := 0;
BEGIN
    -- Calcular total de ganhos do vendedor (90% do valor das contas vendidas)
    SELECT COALESCE(SUM(preco * 0.9), 0) INTO total_earnings
    FROM accounts 
    WHERE vendedor_id = seller_user_id 
    AND status = 'vendido';
    
    -- Calcular total de saques já aprovados
    SELECT COALESCE(SUM(amount), 0) INTO approved_withdrawals
    FROM withdrawal_requests 
    WHERE seller_id = seller_user_id 
    AND status = 'approved';
    
    -- Saldo disponível = ganhos totais - saques aprovados
    available_balance := total_earnings - approved_withdrawals;
    
    RETURN GREATEST(available_balance, 0);
END;
$$;

-- Criar função para calcular saques pendentes do vendedor
CREATE OR REPLACE FUNCTION get_seller_pending_withdrawals(seller_user_id UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pending_amount DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO pending_amount
    FROM withdrawal_requests 
    WHERE seller_id = seller_user_id 
    AND status = 'pending';
    
    RETURN pending_amount;
END;
$$;