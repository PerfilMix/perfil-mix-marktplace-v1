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
    }} size="lg" className="w-full md:w-80 md:mx-auto py-3 font-semibold min-w-0 sm:py-6 text-sm sm:text-lg px-[20px]">
        <div className={`flex items-center w-full gap-2 ${isMobile ? 'justify-center' : 'justify-between px-[70px] mx-[240px]'}`}>
          <div className="flex items-center gap-1">
            {!isMobile && <ShoppingCart className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />}
            <span className="text-sm sm:text-lg font-semibold">Comprar</span>
          </div>
          <span className="text-sm sm:text-lg font-bold whitespace-nowrap">
            {price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          </span>
        </div>
      </Button>;
  }
  return <Button onClick={handlePayment} disabled={disabled || isLoading} className="w-full md:w-80 md:mx-auto py-3 font-semibold disabled:opacity-50 min-w-0 sm:py-6 px-3 text-sm sm:text-lg" style={{
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
      {isLoading ? <div className="flex items-center justify-center w-full gap-2">
          <Loader2 className="h-3 w-3 sm:h-5 sm:w-5 animate-spin flex-shrink-0" />
          <span className="text-sm sm:text-lg font-semibold">Redirecionando...</span>
        </div> : <div className={`flex items-center w-full gap-2 ${isMobile ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-1">
            {!isMobile && <ShoppingCart className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />}
            <span className="text-sm sm:text-lg font-semibold">Comprar</span>
          </div>
          <span className="text-sm sm:text-lg font-bold whitespace-nowrap">
            {price.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
          </span>
        </div>}
    </Button>;
};
export default PaymentButton;