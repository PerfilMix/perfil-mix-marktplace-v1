
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingBag, AlertCircle, RefreshCw, Store, Clock } from "lucide-react";
import { TikTokAccount } from "@/types";
import PurchasedAccountCard from "@/components/dashboard/PurchasedAccountCard";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface PurchasedAccountsSectionProps {
  purchases: TikTokAccount[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isDesktop: boolean;
}

const PurchasedAccountsSection = ({ 
  purchases, 
  isLoading, 
  error, 
  onRetry,
  isDesktop 
}: PurchasedAccountsSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simula progresso durante carregamento
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);

  const handleRetryPurchases = () => {
    console.log("Tentando recarregar compras...");
    toast({
      title: "Recarregando",
      description: "Conectando ao servidor...",
    });
    onRetry();
  };

  const handleBackToMarketplace = () => {
    navigate("/");
  };

  return (
    <div className="lg:col-span-3">
      {(error || isLoading) && (
        <div className="flex justify-end mb-6">
          <Button 
            onClick={handleRetryPurchases}
            variant="outline"
            className="border-tech-accent text-tech-highlight hover:bg-tech-accent/20"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Carregando' : 'Tentar Novamente'}
          </Button>
        </div>
      )}
      
      {error && (
        <Card className="bg-red-900/20 border-red-700 p-4 mb-4">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <p className="font-semibold">Erro ao carregar contas</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={handleRetryPurchases}
              size="sm"
              variant="outline"
              className="border-red-600 text-red-300 hover:bg-red-900/30"
            >
              Tentar Novamente
            </Button>
          </div>
        </Card>
      )}
      
      {isLoading ? (
        <Card className="bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 p-6 text-center shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-tech-highlight mr-3" />
            <Loader2 className="h-8 w-8 animate-spin text-tech-highlight" />
          </div>
          <p className="text-gray-300 mb-3">Carregando suas contas...</p>
          <div className="w-full max-w-xs mx-auto mb-2">
            <Progress value={loadingProgress} className="h-2" />
          </div>
          <p className="text-sm text-gray-400">
            {loadingProgress < 30 ? "Conectando ao servidor..." : 
             loadingProgress < 70 ? "Buscando suas compras..." : 
             "Finalizando carregamento..."}
          </p>
        </Card>
      ) : purchases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {purchases.map(account => (
            <PurchasedAccountCard 
              key={account.id} 
              account={account} 
              isDesktop={isDesktop}
              onUpdate={onRetry}
            />
          ))}
        </div>
      ) : !error ? (
        <Card className="bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 p-6 text-center shadow-lg">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl mb-2 text-white">Nenhuma conta comprada</h3>
          <p className="text-gray-300 mb-4">
            Você ainda não comprou nenhuma conta. Explore o marketplace para encontrar contas incríveis!
          </p>
          <Button 
            onClick={handleBackToMarketplace} 
            className="tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium transition-all duration-300"
          >
            <Store className="h-4 w-4 mr-2" />
            Ver Marketplace
          </Button>
        </Card>
      ) : null}
    </div>
  );
};

export default PurchasedAccountsSection;
