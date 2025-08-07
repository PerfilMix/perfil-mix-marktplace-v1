import { useState, useEffect } from "react";
import { Star, User, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Seller } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface SellerInfoProps {
  vendedorId?: string;
  className?: string;
}

interface RatingData {
  average_rating: number | null;
  total_ratings: number;
  display_rating: boolean;
  minimum_reached: boolean;
}

const SellerInfo = ({ vendedorId, className = "" }: SellerInfoProps) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!vendedorId) return;
      
      setLoading(true);
      try {
        // Buscar informações do vendedor na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', vendedorId)
          .single();

        if (userError) {
          console.error("Erro ao buscar dados do vendedor:", userError);
          setLoading(false);
          return;
        }

        // Buscar número de contas vendidas por este vendedor
        const { data: salesData, error: salesError } = await supabase
          .from('accounts')
          .select('id')
          .eq('vendedor_id', vendedorId)
          .eq('status', 'vendido');

        if (salesError) {
          console.error("Erro ao buscar vendas do vendedor:", salesError);
        }

        // Buscar média de avaliações do vendedor
        const { data: ratingData, error: ratingError } = await supabase
          .rpc('get_seller_average_rating', { seller_user_id: vendedorId });

        if (ratingError) {
          console.error("Erro ao buscar avaliações do vendedor:", ratingError);
        }

        // Usar nome real ou extrair do email se não houver nome
        const displayName = userData.name || userData.email?.split('@')[0] || 'Vendedor';

        // Criar objeto seller com dados reais
        const ratingInfo = ratingData as unknown as RatingData;
        const sellerInfo: Seller = {
          id: userData.id,
          name: displayName,
          rating: ratingInfo?.average_rating || 0,
          total_sales: salesData?.length || 0,
          member_since: userData.created_at
        };
        
        setSeller(sellerInfo);
        
      } catch (error) {
        console.error("Erro ao buscar informações do vendedor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
  }, [vendedorId]);

  if (!vendedorId || loading) {
    return null;
  }

  if (!seller) {
    return null;
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-600'
        }`}
      />
    ));
  };

  const formatMemberSince = (date: string) => {
    const memberDate = new Date(date);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - memberDate.getFullYear()) * 12 + now.getMonth() - memberDate.getMonth();
    
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  return (
    <div className={`bg-tech-card/30 border border-tech-accent/20 rounded-lg p-3 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium text-gray-300 flex items-center gap-1">
          <User className="h-3 w-3" />
          Vendedor
        </h5>
        <Badge variant="outline" className="text-xs border-tech-accent/30 text-tech-highlight bg-tech-accent/10">
          Verificado
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">{seller.name}</span>
          <div className="flex items-center gap-1">
            {seller.rating > 0 ? (
              <>
                {renderStars(seller.rating)}
                <span className="text-xs text-gray-400 ml-1">
                  ({seller.rating.toFixed(1)})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">
                Sem avaliações
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>{seller.total_sales} vendas</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatMemberSince(seller.member_since)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;