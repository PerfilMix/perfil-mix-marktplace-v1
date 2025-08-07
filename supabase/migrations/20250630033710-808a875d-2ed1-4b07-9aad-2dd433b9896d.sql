
-- Remover a constraint que está causando problema
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_key_unique;

-- Criar uma constraint única composta que permita múltiplas entradas do mesmo tipo
-- mas com chaves diferentes
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_type_key_unique 
ON site_settings(type, key);

-- Limpar dados existentes de pagamento que podem estar duplicados
DELETE FROM site_settings WHERE type = 'payment';

-- Inserir as configurações padrão de pagamento
INSERT INTO site_settings (type, key, value, active) VALUES
  ('payment', 'payment_method_pix', 'true', true),
  ('payment', 'payment_method_card', 'true', true);
