-- Adicionar foreign key constraint para withdrawal_requests.seller_id -> users.id
ALTER TABLE public.withdrawal_requests 
ADD CONSTRAINT withdrawal_requests_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;