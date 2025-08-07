
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('account_id');

  return (
    <div className="min-h-screen flex flex-col bg-tech-darker">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 text-white">
            <CardHeader className="text-center pb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-3xl text-green-400">Pagamento Realizado com Sucesso!</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Seu pagamento foi processado com sucesso através do sistema PerfilMix. A conta já foi vinculada ao seu perfil e você pode acessá-la no seu painel.
                </p>
                {accountId && (
                  <p className="text-sm text-gray-500">
                    ID da conta: {accountId}
                  </p>
                )}
              </div>
              
              <div className="bg-tech-darker p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-tech-highlight">Próximos Passos:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• A conta já está disponível no seu painel</li>
                  <li>• Você pode acessar as credenciais completas</li>
                  <li>• Entre em contato conosco se tiver dúvidas</li>
                  <li>• Suporte via WhatsApp disponível 24/7</li>
                </ul>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 bg-tech-accent hover:bg-tech-highlight"
                >
                  Ver Minhas Contas
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1 border-tech-accent text-tech-accent hover:bg-tech-accent hover:text-white"
                >
                  Voltar ao Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
