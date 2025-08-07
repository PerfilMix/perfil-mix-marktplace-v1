-- Recriar o registro do admin principal
INSERT INTO public.admins (email, password)
VALUES ('digitalmakers20@gmail.com', 'Miguelbrito@2022')
ON CONFLICT (email) DO UPDATE SET
    password = 'Miguelbrito@2022';