
-- Inserir configurações padrão para métodos de pagamento
INSERT INTO public.site_settings (type, key, value, active) 
VALUES 
  ('payment', 'payment_method_pix', 'true', true),
  ('payment', 'payment_method_card', 'true', true)
ON CONFLICT DO NOTHING;
