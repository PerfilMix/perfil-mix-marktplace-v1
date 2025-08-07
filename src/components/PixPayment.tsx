import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, QrCode, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PixPaymentProps {
  qrCodeBase64?: string;
  qrCode?: string;
  amount: number;
  transactionId?: string;
  accountId?: string;
  onPaymentConfirmed?: () => void;
}

const PixPayment = ({ qrCodeBase64, qrCode, amount, transactionId, accountId, onPaymentConfirmed }: PixPaymentProps) => {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkingMessage, setCheckingMessage] = useState("Aguardando pagamento...");
  const [checkCount, setCheckCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCopyCode = async () => {
    if (qrCode) {
      try {
        await navigator.clipboard.writeText(qrCode);
        setCopied(true);
        toast({
          title: "Código PIX copiado!",
          description: "Cole no app do seu banco para efetuar o pagamento."
        });
        setTimeout(() => setCopied(false), 3000);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código PIX."
        });
      }
    }
  };

  const checkPaymentStatus = async () => {
    if (!transactionId) return;

    try {
      setIsChecking(true);
      setCheckCount(prev => prev + 1);
      
      // Mensagem diferente baseada no número de verificações
      if (checkCount === 0) {
        setCheckingMessage("Iniciando verificação...");
      } else if (checkCount < 5) {
        setCheckingMessage("Verificando pagamento na API do Mercado Pago...");
      } else if (checkCount < 10) {
        setCheckingMessage("Aguardando confirmação do pagamento...");
      } else {
        setCheckingMessage("Continuando verificação automática...");
      }

      console.log(`[PixPayment] Verificação #${checkCount + 1} - Consultando status do pagamento ${transactionId}`);

      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { transaction_id: transactionId }
      });

      if (error) {
        console.error('[PixPayment] Erro na verificação:', error);
        setCheckingMessage("Erro na verificação. Tentando novamente...");
        return;
      }

      console.log('[PixPayment] Resultado da verificação:', data);

      if (data.status === 'completed') {
        setCheckingMessage("✅ Pagamento confirmado! Redirecionando...");
        
        console.log('[PixPayment] Pagamento aprovado, redirecionando para success page');
        
        toast({
          title: "🎉 Pagamento aprovado!",
          description: "Sua compra foi realizada com sucesso. Redirecionando...",
          duration: 3000
        });

        // Chamar callback se fornecido
        if (onPaymentConfirmed) {
          onPaymentConfirmed();
        }

        // Aguardar um pouco e redirecionar
        setTimeout(() => {
          navigate(`/payment-success?account_id=${accountId || data.account_id}`);
        }, 2000);
        
        return; // Parar verificações após confirmação
      } else if (data.status === 'failed') {
        setCheckingMessage("❌ Pagamento recusado");
        console.log('[PixPayment] Pagamento recusado');
        
        toast({
          variant: "destructive",
          title: "Pagamento recusado",
          description: "Tente novamente ou escolha outro método de pagamento.",
          duration: 5000
        });
        
        return; // Parar verificações após rejeição
      } else {
        // Ainda pendente
        if (checkCount < 5) {
          setCheckingMessage("Aguardando pagamento...");
        } else if (checkCount < 15) {
          setCheckingMessage("Verificação em andamento...");
        } else {
          setCheckingMessage("Continuando verificação automática...");
        }
        
        console.log('[PixPayment] Pagamento ainda pendente, continuando verificação');
      }
    } catch (error) {
      console.error('[PixPayment] Erro na verificação:', error);
      setCheckingMessage("Erro na verificação. Tentando novamente...");
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar automaticamente o status do pagamento
  useEffect(() => {
    if (!transactionId) return;

    console.log('[PixPayment] Iniciando verificação automática para transação:', transactionId);

    // Primeira verificação após 3 segundos
    const initialTimeout = setTimeout(() => {
      checkPaymentStatus();
    }, 3000);

    // Verificações periódicas mais frequentes no início
    const intervals: NodeJS.Timeout[] = [];
    
    // Primeiros 2 minutos: verificar a cada 5 segundos
    intervals.push(setInterval(() => {
      checkPaymentStatus();
    }, 5000));

    // Após 2 minutos, verificar a cada 10 segundos por 8 minutos
    const secondInterval = setTimeout(() => {
      intervals.forEach(clearInterval);
      intervals.push(setInterval(() => {
        checkPaymentStatus();
      }, 10000));
    }, 2 * 60 * 1000);

    // Cleanup após 15 minutos para evitar polling infinito
    const cleanup = setTimeout(() => {
      intervals.forEach(clearInterval);
      clearTimeout(secondInterval);
      setCheckingMessage("Verificação automática finalizada. Recarregue a página para verificar novamente.");
      console.log('[PixPayment] Verificação automática finalizada após 15 minutos');
    }, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(secondInterval);
      clearTimeout(cleanup);
      intervals.forEach(clearInterval);
    };
  }, [transactionId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          Pagamento PIX
        </Badge>
        <h3 className="text-xl font-semibold mt-2 text-white">
          Pague {formatCurrency(amount)} via PIX
        </h3>
        <p className="text-gray-400 mt-1">
          Escaneie o QR Code ou copie o código abaixo
        </p>
      </div>

      {/* Status do pagamento com mais informações */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-blue-400 animate-pulse" />
            )}
            <span className="text-blue-800 font-medium">{checkingMessage}</span>
          </div>
        </CardContent>
      </Card>

      {qrCodeBase64 && (
        <Card className="bg-white p-4">
          <CardContent className="flex justify-center p-0">
            <div className="text-center">
              <QrCode className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <img 
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="max-w-[200px] max-h-[200px] mx-auto border rounded"
              />
              <p className="text-sm text-gray-600 mt-2">
                Escaneie com o app do seu banco
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {qrCode && (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              Ou copie o código PIX:
            </p>
          </div>
          
          <Card className="bg-tech-card border-tech-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-tech-darker rounded border text-white text-sm font-mono break-all">
                  {qrCode}
                </div>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-tech-accent text-tech-accent hover:bg-tech-accent hover:text-white"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">
          ✅ Instruções para pagamento PIX:
        </h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Abra o app do seu banco</li>
          <li>• Escaneie o QR Code ou cole o código PIX</li>
          <li>• Confirme o pagamento de {formatCurrency(amount)}</li>
          <li>• Após a confirmação, sua conta será liberada automaticamente em até 30 segundos</li>
        </ul>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          O pagamento via PIX é verificado automaticamente a cada 5 segundos.
          <br />
          Mantenha esta página aberta - redirecionaremos automaticamente após a confirmação.
        </p>
      </div>
    </div>
  );
};

export default PixPayment;
