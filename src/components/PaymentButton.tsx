import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
interface PaymentButtonProps {
  accountId: string;
  accountName: string;
  price: number;
  currency: string;
  disabled?: boolean;
  isAccountSold?: boolean;
}
const PaymentButton = ({
  accountId,
  accountName,
  price,
  currency,
  disabled = false,
  isAccountSold = false
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const handlePayment = async () => {
    if (!isAuthenticated) {
      // Captura a URL atual e passa como parâmetro redirect
      const currentPath = location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (isAccountSold) {
      toast({
        variant: "destructive",
        title: "Conta não disponível",
        description: "Esta conta já foi vendida."
      });
      return;
    }
    setIsLoading(true);
    try {
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to checkout page with Mercado Pago integration
      navigate(`/checkout/${accountId}`);
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível abrir a página de checkout. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (isAccountSold) {
    return <Button disabled className="w-full bg-gray-500 text-white text-lg py-6 font-semibold cursor-not-allowed" size="lg">
        <ShoppingCart className="h-5 w-5 mr-2" />
        Conta Vendida
      </Button>;
  }
  if (!isAuthenticated) {
    return <Button onClick={handlePayment} style={{
      backgroundColor: 'hsl(var(--button-purchase))',
      color: 'hsl(var(--button-success-text))'
    }} onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = 'hsl(var(--button-purchase) / 0.9)';
    }} onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = 'hsl(var(--button-purchase))';
    }} size="lg" className="w-full py-4 font-semibold min-w-0 sm:py-6 sm:text-lg mx-0 px-[9px]">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
          <div className="flex items-center gap-2">
            {!isMobile && <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />}
            <span className="text-lg sm:text-lg">Comprar</span>
          </div>
          <span className="text-base sm:text-lg font-bold">
            {price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          </span>
        </div>
      </Button>;
  }
  return <Button onClick={handlePayment} disabled={disabled || isLoading} className="w-full py-4 font-semibold disabled:opacity-50 min-w-0 sm:py-6 sm:text-lg" style={{
    backgroundColor: 'hsl(var(--button-purchase))',
    color: 'hsl(var(--button-success-text))'
  }} onMouseEnter={e => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = 'hsl(var(--button-purchase) / 0.9)';
    }
  }} onMouseLeave={e => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = 'hsl(var(--button-purchase))';
    }
  }} size="lg">
      {isLoading ? <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin flex-shrink-0" />
            <span className="text-sm sm:text-lg">Redirecionando...</span>
          </div>
        </div> : <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
          <div className="flex items-center gap-2">
            {!isMobile && <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />}
            <span className="text-lg sm:text-lg">Comprar</span>
          </div>
          <span className="text-base sm:text-lg font-bold">
            {price.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
          </span>
        </div>}
    </Button>;
};
export default PaymentButton;