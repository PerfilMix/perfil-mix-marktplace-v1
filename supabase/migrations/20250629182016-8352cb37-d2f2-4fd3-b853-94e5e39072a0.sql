
-- Update the accounts table to support new status values
-- First, let's see what status values currently exist and update them

-- Update existing 'disponível' status to 'disponivel_venda' for compatibility
UPDATE accounts 
SET status = 'disponivel_venda' 
WHERE status = 'disponível';

-- Add a check constraint to ensure only valid status values are allowed
-- Note: We'll use a trigger instead of CHECK constraint for flexibility
CREATE OR REPLACE FUNCTION validate_account_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN ('disponivel_venda', 'em_producao', 'vendido') THEN
        RAISE EXCEPTION 'Status deve ser: disponivel_venda, em_producao, ou vendido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate status on insert and update
DROP TRIGGER IF EXISTS validate_account_status_trigger ON accounts;
CREATE TRIGGER validate_account_status_trigger
    BEFORE INSERT OR UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION validate_account_status();
