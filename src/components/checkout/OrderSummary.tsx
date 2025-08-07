
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/helpers";
import { TikTokAccount } from "@/types";

interface OrderSummaryProps {
  account: TikTokAccount;
}

const OrderSummary = ({ account }: OrderSummaryProps) => {
  return (
    <Card className="bg-tech-card border-tech-accent/20 shadow-tech">
      <CardHeader>
        <CardTitle className="text-lg text-white">Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">{account.nome}</h3>
            <Badge variant="secondary" className="mt-1 bg-tech-accent text-white">
              {account.plataforma}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(account.preco)}
            </div>
          </div>
        </div>
        
        <div className="border-t border-tech-accent/20 pt-4">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal:</span>
            <span>{formatCurrency(account.preco)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg mt-2">
            <span className="text-white">Total:</span>
            <span className="text-green-500">{formatCurrency(account.preco)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
