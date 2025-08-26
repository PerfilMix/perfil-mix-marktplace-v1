import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Shield, Zap, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";

const Landing = () => {
  const [brandingSettings, setBrandingSettings] = useState({ site_name: "Compra de Conta" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchBrandingSettings = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: brandingData, error } = await supabase
          .from("site_settings")
          .select("key, value")
          .eq("type", "branding")
          .eq("key", "site_name")
          .eq("active", true);
          
        if (error) throw error;
        
        if (brandingData && brandingData.length > 0) {
          setBrandingSettings({ site_name: brandingData[0].value || "Compra de Conta" });
        }
      } catch (error) {
        console.error("Error fetching branding settings:", error);
      }
    };

    fetchBrandingSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tech-darker">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tech-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-tech-darker via-tech-darker to-tech-card/20">
      {/* Header */}
      <header className="bg-header-bg border-b border-tech-accent/50 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/public/images/PerfilMix.png"
" 
              alt="Logo" 
              className="h-12 w-12 mr-2"
            />
            <span className="text-xl font-bold text-white">{brandingSettings.site_name}</span>
          </div>
          
          <Link to="/login">
            <Button className="btn-primary">
              Entrar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 tech-gradient opacity-5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-tech-highlight to-tech-accent opacity-5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="container mx-auto px-6 py-20 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Marketplace de Contas
              <span className="tech-gradient bg-clip-text text-transparent block">
                Verificadas
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Encontre contas verificadas de TikTok, YouTube e Kwai para impulsionar seu negócio digital. 
              Compre com segurança e comece a crescer hoje mesmo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/login">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Começar Agora
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-tech-highlight hover:bg-tech-accent/20 text-lg px-8 py-4">
                  Ver Contas Disponíveis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="glass-card border-tech-accent/30 text-center p-8">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 tech-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">100% Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Todas as contas são verificadas e entregues com garantia de funcionamento.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-tech-accent/30 text-center p-8">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 tech-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Entrega Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Receba suas contas imediatamente após a confirmação do pagamento.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-tech-accent/30 text-center p-8">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 tech-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Qualidade Garantida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Contas com histórico limpo e alta taxa de engajamento.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-16 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Junte-se a milhares de usuários que já impulsionaram seus negócios com nossas contas verificadas.
            </p>
            <Link to="/login">
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
