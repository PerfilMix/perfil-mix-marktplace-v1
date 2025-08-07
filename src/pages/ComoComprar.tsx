import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ShoppingCart, CreditCard, Mail, Users } from "lucide-react";
const ComoComprar = () => {
  return <div className="min-h-screen bg-tech-darker flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-lg text-white mb-8 text-center">
            Como Comprar
          </h1>
          
          <div className="space-y-8">
            {/* Processo de Compra */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Processo de Compra
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start space-x-4">
                  <div className="bg-tech-accent p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Passo 1: Seleção da Conta
                    </h3>
                    <p className="text-gray-300">
                      Escolha a conta desejada, filtrando por plataforma, nicho, país e engajamento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-tech-accent p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Passo 2: Finalização da Compra
                    </h3>
                    <p className="text-gray-300">Clique em &quot;Comprar Agora&quot; para ser redirecionado à página de pagamento. Preencha as informações necessárias, como e-mail e CPF, e clique no botão para finalizar a compra.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-tech-accent p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Passo 3: Confirmação do Pagamento
                    </h3>
                    <p className="text-gray-300">Após o pagamento ser processado, você receberá imediatamente o acesso da conta dentro do seu Painel de Usuário.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-tech-accent p-3 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Passo 4: Credenciais da Conta</h3>
                    <p className="text-gray-300">Agora a conta estará sempre disponivel no seu painel onde você poderá copiar, editar as credenciais de acesso da conta comprada.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Perguntas Frequentes (FAQ)
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Como posso comprar uma conta?
                  </h3>
                  <p className="text-gray-300">
                    Escolha a conta desejada, adicione ao carrinho e siga o processo de pagamento. Você receberá as credenciais após a confirmação do pagamento.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Quais formas de pagamento são aceitas?
                  </h3>
                  <p className="text-gray-300">
                    Atualmente, aceitamos pagamento via PIX.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Posso pedir reembolso?
                  </h3>
                  <p className="text-gray-300">
                    Não oferecemos reembolsos, pois as contas adquiridas são entregues de imediato após a confirmação do pagamento.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Como posso entrar em contato?
                  </h3>
                  <p className="text-gray-300">
                    Se tiver dúvidas ou precisar de ajuda, entre em contato com o suporte através dos canais disponíveis no rodapé do site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default ComoComprar;