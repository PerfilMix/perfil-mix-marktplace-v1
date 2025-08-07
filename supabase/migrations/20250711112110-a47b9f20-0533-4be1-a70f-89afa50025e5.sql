-- Adicionar foreign key entre seller_requests e users
ALTER TABLE public.seller_requests 
ADD CONSTRAINT seller_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;