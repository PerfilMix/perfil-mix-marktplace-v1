import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/helpers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, Clock, CheckCircle } from "lucide-react";

interface WithdrawalRequestProps {
  onRequestSubmitted?: () => void;
}

const WithdrawalRequest = ({ onRequestSubmitted }: WithdrawalRequestProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const maxWithdrawal = availableBalance - pendingWithdrawals;

  useEffect(() => {
    if (user) {
      fetchBalanceData();
    }
  }, [user]);

  const fetchBalanceData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Calcular saldo disponível: 90% do valor das contas vendidas
      const { data: soldAccounts, error: soldError } = await supabase
        .from('accounts')
        .select('preco')
        .eq('vendedor_id', user.id)
        .eq('status', 'vendido');
      
      if (soldError) throw soldError;
      
      const totalEarnings = soldAccounts?.reduce((sum, account) => 
        sum + (account.preco || 0) * 0.9, 0) || 0;
      
      // Buscar todos os saques (pendentes, aprovados e processados) para deduzir do saldo
      const { data: allWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('amount, status')
        .eq('seller_id', user.id)
        .in('status', ['pending', 'approved', 'processed']);
      
      if (withdrawalsError) throw withdrawalsError;
      
      // Calcular total de saques que devem ser deduzidos do saldo
      const totalWithdrawn = allWithdrawals?.reduce((sum, request) => 
        sum + (request.amount || 0), 0) || 0;
      
      // Calcular apenas saques pendentes para mostrar separadamente
      const pendingAmount = allWithdrawals?.filter(w => w.status === 'pending')
        .reduce((sum, request) => sum + (request.amount || 0), 0) || 0;
      
      // Saldo disponível = ganhos totais - todos os saques (pendentes, aprovados e processados)
      const availableBalance = totalEarnings - totalWithdrawn;
      
      setAvailableBalance(availableBalance);
      setPendingWithdrawals(pendingAmount);
      
    } catch (error: any) {
      console.error('Erro ao buscar dados de saldo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível carregar os dados de saldo."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para saque."
      });
      return;
    }

    if (amount > maxWithdrawal) {
      toast({
        variant: "destructive",
        title: "Valor excede limite",
        description: `Você pode sacar no máximo ${formatCurrency(maxWithdrawal)}.`
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Inserir solicitação na tabela withdrawal_requests
      const { error: insertError } = await supabase
        .from('withdrawal_requests')
        .insert({
          seller_id: user.id,
          amount: amount,
          status: 'pending'
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Solicitação enviada",
        description: `Sua solicitação de saque de ${formatCurrency(amount)} foi enviada para análise. O processamento leva de 24 a 48 horas.`
      });

      setIsModalOpen(false);
      setWithdrawalAmount("");
      
      // Atualizar dados após envio
      await fetchBalanceData();
      
      // Forçar atualização dos dados financeiros gerais
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
      
    } catch (error: any) {
      console.error('Erro ao solicitar saque:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível processar sua solicitação. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-tech-highlight" />
            Solicitação de Saque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-4 bg-tech-darker rounded-lg animate-pulse">
                <div className="h-4 bg-tech-border rounded mb-2"></div>
                <div className="h-8 bg-tech-border rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-tech-highlight" />
            Solicitação de Saque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-tech-darker rounded-lg">
              <p className="text-tech-light text-sm">Saldo Disponível</p>
              <p className="text-2xl font-bold text-tech-highlight">
                {formatCurrency(availableBalance)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-tech-darker rounded-lg">
              <p className="text-tech-light text-sm">Saques Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">
                {formatCurrency(pendingWithdrawals)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-tech-darker rounded-lg">
              <p className="text-tech-light text-sm">Máx. para Saque</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(maxWithdrawal)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={maxWithdrawal <= 0}
              className="bg-tech-highlight hover:bg-tech-highlight/80 text-white font-medium w-full sm:w-auto"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Solicitar Saque
            </Button>
            
            <div className="flex items-center gap-2 text-tech-light text-sm">
              <Clock className="h-4 w-4" />
              <span>Processamento: 24-48h</span>
            </div>
          </div>

          {maxWithdrawal <= 0 && (
            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                Não há saldo disponível para saque no momento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-tech-secondary border-tech-border">
          <DialogHeader>
            <DialogTitle className="text-white">Solicitar Saque</DialogTitle>
            <DialogDescription className="text-tech-light">
              Informe o valor que deseja sacar. O processamento leva de 24 a 48 horas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="withdrawal-amount" className="text-tech-light">
                Valor do Saque (R$)
              </Label>
              <Input
                id="withdrawal-amount"
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="0,00"
                max={maxWithdrawal}
                className="bg-tech-darker border-tech-border text-white mt-1"
              />
              <p className="text-tech-light text-sm mt-1">
                Máximo disponível: {formatCurrency(maxWithdrawal)}
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Processo de Saque:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Solicitação enviada para análise</li>
                    <li>• Aprovação em até 24 horas</li>
                    <li>• Transferência em até 48 horas</li>
                    <li>• Você receberá notificações sobre o status</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="border-tech-border text-tech-light hover:bg-tech-darker"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitWithdrawal} 
              disabled={isSubmitting || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0}
              className="bg-tech-highlight hover:bg-tech-highlight/80 text-white"
            >
              {isSubmitting ? "Enviando..." : "Confirmar Saque"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WithdrawalRequest;