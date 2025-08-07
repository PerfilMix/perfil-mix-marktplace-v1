import { useState, useEffect } from "react";
import { Star, TrendingUp, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/helpers";

interface SellerRating {
  id: string;
  rating: number;
  created_at: string;
  user_id: string;
  account: {
    id: string;
    nome: string;
    preco: number;
    plataforma: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

interface RatingData {
  average_rating: number | null;
  total_ratings: number;
  display_rating: boolean;
  minimum_reached: boolean;
}

interface SellerRatingsOverviewProps {
  sellerId?: string;
}

const SellerRatingsOverview = ({ sellerId }: SellerRatingsOverviewProps) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [displayRating, setDisplayRating] = useState<boolean>(false);
  const [minimumReached, setMinimumReached] = useState<boolean>(false);
  const [ratings, setRatings] = useState<SellerRating[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sellerId) {
      fetchSellerRatings();
    }
  }, [sellerId]);

  const fetchSellerRatings = async () => {
    if (!sellerId) return;

    setLoading(true);
    try {
      // Buscar média de avaliações
      const { data: avgData, error: avgError } = await supabase
        .rpc('get_seller_average_rating', { seller_user_id: sellerId });

      if (avgError) {
        console.error("Erro ao buscar média:", avgError);
        setError("Erro ao carregar dados de avaliação");
      } else {
        const ratingData = avgData as unknown as RatingData;
        setAverageRating(ratingData?.average_rating || null);
        setTotalRatings(ratingData?.total_ratings || 0);
        setDisplayRating(ratingData?.display_rating || false);
        setMinimumReached(ratingData?.minimum_reached || false);
        setError(null);
      }

      // Buscar todas as avaliações com detalhes
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('seller_ratings')
        .select(`
          id,
          rating,
          created_at,
          user_id,
          account:accounts(id, nome, preco, plataforma)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (ratingsError) {
        console.error("Erro ao buscar avaliações:", ratingsError);
        setError("Erro ao carregar histórico de avaliações");
      } else {
        // Filtrar apenas avaliações que ainda têm contas válidas
        const validRatings = ratingsData?.filter(rating => rating.account) || [];
        setRatings(validRatings);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError("Erro inesperado ao carregar avaliações");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4", 
      lg: "h-5 w-5"
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-600'
        }`}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">{error}</div>
            <button 
              onClick={() => {
                setError(null);
                fetchSellerRatings();
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-tech-light">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-tech-secondary border-tech-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Minhas Avaliações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Geral */}
        <div className="text-center space-y-3">
          {displayRating && averageRating !== null ? (
            <>
              <div className="flex items-center justify-center gap-2">
                {renderStars(averageRating, "lg")}
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-tech-light text-sm">
                  Baseado em {totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'}
                  {!minimumReached && (
                    <div className="text-yellow-400 text-xs mt-1">
                      ⚡ Média suavizada (mínimo de 5 avaliações para média final)
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="text-2xl font-bold text-tech-light mb-2">
                Sem avaliações
              </div>
              <div className="text-tech-light text-sm">
                Você ainda não recebeu avaliações
              </div>
            </div>
          )}
        </div>

        {totalRatings > 0 && (
          <>
            <Separator className="bg-tech-border" />

            {/* Distribuição das Estrelas */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white mb-3">Distribuição</h4>
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="text-tech-light w-2">{stars}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-tech-darker rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalRatings > 0 ? (distribution[stars as keyof typeof distribution] / totalRatings) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-tech-light w-6 text-right">
                    {distribution[stars as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="bg-tech-border" />

            {/* Lista de Avaliações Individuais */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-tech-highlight" />
                <h4 className="text-sm font-medium text-white">Avaliações por Conta</h4>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {ratings.map((rating) => (
                  <div 
                    key={rating.id}
                    className="bg-tech-darker rounded-lg p-3 border border-tech-border/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-medium text-white truncate">
                            {rating.account.nome}
                          </h5>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-tech-accent/30 text-tech-highlight bg-tech-accent/10"
                          >
                            {rating.account.plataforma}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(rating.rating, "sm")}
                          <span className="text-xs text-tech-light">
                            ({rating.rating}/5)
                          </span>
                        </div>
                        <div className="text-xs text-tech-light">
                          Por: {rating.user?.name || rating.user?.email || 'Usuário'}
                        </div>
                        <div className="text-xs text-tech-light">
                          Valor: {formatCurrency(rating.account.preco)}
                        </div>
                      </div>
                      <div className="text-xs text-tech-light whitespace-nowrap">
                        {new Date(rating.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {totalRatings === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-tech-light/50 mx-auto mb-3" />
            <p className="text-tech-light">
              Você ainda não recebeu avaliações.
            </p>
            <p className="text-tech-light text-sm mt-1">
              As avaliações aparecerão aqui após suas vendas serem avaliadas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerRatingsOverview;