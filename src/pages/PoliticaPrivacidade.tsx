
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-tech-darker flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-lg text-white mb-8 text-center">
            Política de Privacidade
          </h1>
          
          <div className="glass-card p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Informações Coletadas
              </h2>
              <p className="text-gray-300 leading-relaxed">
                A PerfilMix coleta dados pessoais, como nome, e-mail, CPF, número de telefone e informações de pagamento para processar compras. Esses dados são armazenados de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Uso das Informações
              </h2>
              <div className="text-gray-300 space-y-2">
                <p>As informações coletadas são usadas para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Processar pedidos e pagamentos</li>
                  <li>Comunicar-se com o usuário sobre alterações ou atualizações no sistema</li>
                  <li>Melhorar o sistema e a experiência do usuário</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. Segurança dos Dados
              </h2>
              <p className="text-gray-300 leading-relaxed">
                A PerfilMix adota medidas de segurança para proteger seus dados, incluindo criptografia para transações de pagamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Compartilhamento de Informações
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Não compartilhamos suas informações com terceiros, exceto quando exigido por lei ou para processar transações relacionadas à compra.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Direitos dos Usuários
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Os usuários podem acessar, corrigir ou excluir suas informações pessoais através da área de configurações da conta.
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;
