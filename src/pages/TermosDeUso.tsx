
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-tech-darker flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-lg text-white mb-8 text-center">
            Termos de Uso
          </h1>
          
          <div className="glass-card p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Introdução
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Este documento regula o uso do sistema Compra de Conta, fornecendo acesso às contas de mídias sociais para venda ou troca de perfis, com filtros como nicho, plataforma e engajamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Aceitação dos Termos
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Ao acessar e utilizar o site Compra de Conta, você concorda com os termos descritos. Caso não concorde, não utilize o sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. Uso do Sistema
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  O sistema oferece contas de redes sociais com diferentes perfis (TikTok, YouTube, etc.), segmentadas por nicho e engajamento.
                </p>
                <p>
                  O usuário se compromete a utilizar os serviços para fins legais e respeitar as regras de cada plataforma social.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Limitações de Responsabilidade
              </h2>
              <p className="text-gray-300 leading-relaxed">
                O Compra de Conta não se responsabiliza por possíveis danos diretos ou indiretos decorrentes do uso das contas adquiridas, incluindo problemas com plataformas de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Alterações nos Termos
              </h2>
              <p className="text-gray-300 leading-relaxed">
                O Compra de conta pode alterar esses termos a qualquer momento. É responsabilidade do usuário revisar os termos periodicamente.
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermosDeUso;
