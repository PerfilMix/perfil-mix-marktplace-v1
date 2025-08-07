-- Atualizar função para calcular média ponderada de avaliações
CREATE OR REPLACE FUNCTION public.get_seller_average_rating(seller_user_id UUID)
RETURNS JSON
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  WITH rating_stats AS (
    SELECT 
      COUNT(*) as total_ratings,
      AVG(rating::decimal) as simple_average,
      -- Calcular média ponderada com pesos reduzidos para avaliações extremas
      SUM(CASE 
        WHEN rating = 1 THEN rating * 0.5  -- Peso reduzido para 1 estrela
        WHEN rating = 2 THEN rating * 0.8  -- Peso ligeiramente reduzido para 2 estrelas
        WHEN rating = 5 THEN rating * 1.2  -- Peso ligeiramente maior para 5 estrelas
        ELSE rating * 1.0                  -- Peso normal para 3 e 4 estrelas
      END) as weighted_sum,
      SUM(CASE 
        WHEN rating = 1 THEN 0.5
        WHEN rating = 2 THEN 0.8
        WHEN rating = 5 THEN 1.2
        ELSE 1.0
      END) as weight_sum
    FROM public.seller_ratings
    WHERE seller_id = seller_user_id
  )
  SELECT jsonb_build_object(
    'average_rating', 
    CASE 
      WHEN total_ratings >= 5 THEN 
        ROUND(weighted_sum / weight_sum, 2)
      WHEN total_ratings >= 1 THEN 
        -- Para vendedores com poucas avaliações, usar uma média suavizada
        ROUND((weighted_sum + (5 - total_ratings) * 4.0) / (weight_sum + (5 - total_ratings)), 2)
      ELSE 
        NULL  -- Sem avaliações
    END,
    'total_ratings', total_ratings,
    'display_rating', total_ratings >= 1,
    'minimum_reached', total_ratings >= 5
  )
  FROM rating_stats;
$$;