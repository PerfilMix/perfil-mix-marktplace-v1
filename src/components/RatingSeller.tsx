import { useState, useEffect } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RatingSellerProps {
  accountId: string;
  sellerId: string;
  onRatingSubmitted?: () => void;
}

const RatingSeller = ({ accountId, sellerId, onRatingSubmitted }: RatingSellerProps) => {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingRating();
  }, [accountId]);

  const checkExistingRating = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_ratings')
        .select('rating')
        .eq('account_id', accountId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (data) {
        setHasRated(true);
        setExistingRating(data.rating);
      }
    } catch (error) {
      // Usuário ainda não avaliou
    }
  };

  const submitRating = async () => {
    if (!currentRating || hasRated) return;

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('seller_ratings')
        .insert({
          user_id: user.user.id,
          seller_id: sellerId,
          account_id: accountId,
          rating: currentRating
        });

      if (error) throw error;

      setHasRated(true);
      setExistingRating(currentRating);
      onRatingSubmitted?.();
      
      toast({
        description: "Avaliação enviada com sucesso!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        description: "Erro ao enviar avaliação. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const displayRating = hasRated ? existingRating : (hoveredRating || currentRating);
    
    return Array.from({ length: 5 }, (_, i) => {
      const starIndex = i + 1;
      const isActive = displayRating !== null && starIndex <= displayRating;
      
      return (
        <button
          key={i}
          type="button"
          disabled={hasRated}
          onClick={() => !hasRated && setCurrentRating(starIndex)}
          onMouseEnter={() => !hasRated && setHoveredRating(starIndex)}
          onMouseLeave={() => !hasRated && setHoveredRating(null)}
          className={`p-1 transition-colors ${
            hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`h-5 w-5 ${
              isActive
                ? 'text-yellow-400 fill-current'
                : 'text-gray-400'
            }`}
          />
        </button>
      );
    });
  };

  if (hasRated) {
    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <ThumbsUp className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">
            Você avaliou este vendedor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sua avaliação:</span>
          <div className="flex">{renderStars()}</div>
          <span className="text-xs text-gray-400">
            ({existingRating}/5)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-white mb-1">
          Avalie este vendedor
        </h4>
        <p className="text-xs text-gray-400">
          Sua avaliação ajuda outros compradores
        </p>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex">{renderStars()}</div>
        {currentRating && (
          <span className="text-xs text-gray-400">
            ({currentRating}/5)
          </span>
        )}
      </div>

      <Button
        onClick={submitRating}
        disabled={!currentRating || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-8"
        size="sm"
      >
        {loading ? "Enviando..." : "Enviar Avaliação"}
      </Button>
    </div>
  );
};

export default RatingSeller;