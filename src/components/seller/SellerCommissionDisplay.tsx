import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Percent, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SellerCommissionDisplay = () => {
  const [commissionPercentage, setCommissionPercentage] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCommission();
    }
  }, [user]);

  const fetchCommission = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_seller_commission', { seller_user_id: user.id });

      if (error) {
        console.error('Erro ao buscar comissão:', error);
      } else {
        setCommissionPercentage(data || 10);
      }
    } catch (error) {
      console.error('Erro ao buscar comissão:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  const isDefaultCommission = commissionPercentage === 10;

  if (loading) {
    return (
      <Card className="bg-tech-secondary border-tech-border">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-tech-border rounded mb-2"></div>
            <div className="h-6 bg-tech-border rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-tech-secondary border-tech-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Percent className="h-5 w-5 text-tech-accent" />
          Comissão Aplicada
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`text-lg font-bold px-3 py-1 ${
                isDefaultCommission 
                  ? 'border-green-500 text-green-400 bg-green-500/10' 
                  : 'border-tech-accent text-tech-accent bg-tech-accent/10'
              }`}
            >
              {formatPercentage(commissionPercentage)}
            </Badge>
            {isDefaultCommission && (
              <Badge variant="secondary" className="text-xs">
                Padrão
              </Badge>
            )}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-300 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="bg-tech-darker border-tech-border text-white max-w-xs">
                <p className="text-sm">
                  💰 <strong>Comissão aplicada:</strong> {formatPercentage(commissionPercentage)}
                  <br />
                  📊 Seus ganhos são calculados automaticamente com base nesse percentual
                  <br />
                  ⚡ Apenas vendas futuras são afetadas por mudanças na comissão
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerCommissionDisplay;