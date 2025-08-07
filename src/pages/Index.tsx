import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { isDesktop } from "@/lib/helpers";
import { Loader2, AlertCircle, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AccountCard from "@/components/AccountCard";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import MobileFilterDrawer from "@/components/MobileFilterDrawer";
import AntiInspectionProtection from "@/components/AntiInspectionProtection";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { TikTokAccount } from "@/types";
import BannerDisplay from "@/components/BannerDisplay";
import { usePreloader } from "@/hooks/usePreloader";

const Index = () => {
  const [isDesktopView, setIsDesktopView] = useState(isDesktop());
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<TikTokAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null);
  const [selectedSeguidores, setSelectedSeguidores] = useState<string>("todos");
  const [selectedPais, setSelectedPais] = useState<string>("todos");
  const [selectedPreco, setSelectedPreco] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Preload recursos importantes
  usePreloader();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(isDesktop());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAvailableAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      setAccountsError(null);
      
      // Buscar apenas contas disponíveis para venda (não compradas e não em produção) ordenadas por seguidores em ordem decrescente
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("status", "disponivel_venda")
        .is("comprada_por", null)
        .order("seguidores", { ascending: false }); // Ordenação por seguidores decrescente

      if (error) {
        throw error;
      }

      // Transform data to match TikTokAccount interface (without moeda)
      const transformedAccounts: TikTokAccount[] = (data || []).map(account => ({
        id: account.id,
        nome: account.nome,
        seguidores: account.seguidores,
        clientes: account.clientes,
        nicho: account.nicho,
        nicho_customizado: account.nicho_customizado,
        pais: account.pais,
        login: account.login,
        senha: account.senha,
        preco: account.preco,
        status: account.status as 'disponivel_venda' | 'em_producao' | 'vendido',
        comprada_por: account.comprada_por,
        plataforma: account.plataforma as 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify',
        tiktok_shop: account.tiktok_shop as 'Sim' | 'Não',
        engajamento: account.engajamento as 'Alto' | 'Médio' | 'Baixo',
        descricao_loja: account.descricao_loja,
        vendas_mensais: account.vendas_mensais,
        produtos_cadastrados: account.produtos_cadastrados,
        trafego_mensal: account.trafego_mensal,
        integracoes_ativas: account.integracoes_ativas,
        dominio_incluso: account.dominio_incluso,
        loja_pronta: account.loja_pronta,
        profile_image_url: account.profile_image_url,
        account_screenshot_url: account.account_screenshot_url,
      }));

      setAccounts(transformedAccounts);
      setFilteredAccounts(transformedAccounts);
    } catch (error: any) {
      console.error("Erro ao carregar contas:", error);
      setAccountsError("Erro ao carregar contas disponíveis");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAvailableAccounts();
  }, []);

  // Filter accounts based on selected filters - FIXED filtering logic
  useEffect(() => {
    let filtered = [...accounts];

    if (selectedPlatform && selectedPlatform !== "todos") {
      filtered = filtered.filter(account => account.plataforma === selectedPlatform);
    }

    if (selectedNicho && selectedNicho !== "todos") {
      filtered = filtered.filter(account => 
        account.nicho === selectedNicho || account.nicho_customizado === selectedNicho
      );
    }

    if (selectedPais && selectedPais !== "todos") {
      filtered = filtered.filter(account => account.pais === selectedPais);
    }

    // FIXED: Updated seguidores filtering logic with correct ranges
    if (selectedSeguidores && selectedSeguidores !== "todos") {
      const ranges = {
        "100-10k": { min: 100, max: 10000 },
        "10k-50k": { min: 10000, max: 50000 },
        "50k-100k": { min: 50000, max: 100000 },
        "100k-500k": { min: 100000, max: 500000 },
        "500k-1m": { min: 500000, max: 1000000 },
        "1m+": { min: 1000000, max: Infinity }
      };
      
      const range = ranges[selectedSeguidores as keyof typeof ranges];
      if (range) {
        filtered = filtered.filter(account => 
          account.seguidores >= range.min && account.seguidores < range.max
        );
      }
    }

    // Price filtering logic
    if (selectedPreco && selectedPreco !== "todos") {
      const ranges = {
        "0-100": { min: 0, max: 100 },
        "100-200": { min: 100, max: 200 },
        "200-300": { min: 200, max: 300 },
        "300-400": { min: 300, max: 400 },
        "400+": { min: 400, max: Infinity }
      };
      
      const range = ranges[selectedPreco as keyof typeof ranges];
      if (range) {
        filtered = filtered.filter(account => 
          account.preco >= range.min && account.preco < range.max
        );
      }
    }

    console.log("Filtered accounts:", filtered.length, "from", accounts.length, "total accounts");
    console.log("Applied filters:", { selectedPlatform, selectedNicho, selectedPais, selectedSeguidores, selectedPreco });
    
    setFilteredAccounts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [accounts, selectedPlatform, selectedNicho, selectedPais, selectedSeguidores, selectedPreco]);

  const clearFilters = () => {
    setSelectedPlatform(null);
    setSelectedNicho(null);
    setSelectedPais("todos");
    setSelectedSeguidores("todos");
    setSelectedPreco("todos");
    setFilteredAccounts(accounts);
  };

  return (
    <div className="min-h-screen flex flex-col bg-tech-darker">
      <AntiInspectionProtection level="light" showToast={true} />
      <Navbar />
      
      <main className="mx-auto px-1 md:px-4 py-8 flex-grow max-w-full">
        {/* Banner Display - now inside container with same width as filters */}
        <BannerDisplay />
        
        {/* Header simplificado */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Área vazia - textos e botões removidos conforme solicitado */}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Área vazia - botão "Fazer Login" removido */}
          </div>
        </div>
        
        {/* Botão Mobile Filter */}
        <div className="mb-6 md:hidden">
          <MobileFilterDrawer
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedNicho={selectedNicho}
            setSelectedNicho={setSelectedNicho}
            selectedSeguidores={selectedSeguidores}
            setSelectedSeguidores={setSelectedSeguidores}
            selectedPais={selectedPais}
            setSelectedPais={setSelectedPais}
            selectedPreco={selectedPreco}
            setSelectedPreco={setSelectedPreco}
            onClearFilters={clearFilters}
          />
        </div>
        
        {/* Desktop Filter Bar */}
        <FilterBar 
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedNicho={selectedNicho}
          setSelectedNicho={setSelectedNicho}
          selectedSeguidores={selectedSeguidores}
          setSelectedSeguidores={setSelectedSeguidores}
          selectedPais={selectedPais}
          setSelectedPais={setSelectedPais}
          selectedPreco={selectedPreco}
          setSelectedPreco={setSelectedPreco}
        />
        
        {accountsError && (
          <Card className="bg-red-900/20 border-red-700 p-4 mb-4">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="h-5 w-5" />
              <p>{accountsError}</p>
            </div>
          </Card>
        )}
        
        {isLoadingAccounts ? (
          <Card className="bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 p-6 text-center shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-tech-highlight" />
            <p className="text-gray-300">Carregando contas disponíveis...</p>
          </Card>
        ) : filteredAccounts.length > 0 ? (
          <>
            {/* Grid with 2 columns on mobile, 2 on tablet, 3 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-6">
              {filteredAccounts
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(account => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    showCredentials={false}
                    isDesktop={isDesktopView}
                    showEngagement={false}
                  />
                ))}
            </div>
            
            {/* Pagination */}
            {filteredAccounts.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-tech-accent text-tech-highlight hover:bg-tech-accent/20 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(filteredAccounts.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={
                        currentPage === page 
                          ? "tech-gradient text-white" 
                          : "border-tech-accent text-tech-highlight hover:bg-tech-accent/20"
                      }
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAccounts.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredAccounts.length / itemsPerPage)}
                  variant="outline"
                  className="border-tech-accent text-tech-highlight hover:bg-tech-accent/20 disabled:opacity-50"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
          
        ) : (
          <Card className="bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 p-6 text-center shadow-lg">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2 text-white">Nenhuma conta encontrada</h3>
            <p className="text-gray-300 mb-4">Não há contas disponíveis com os filtros selecionados.</p>
            <Button
              onClick={clearFilters}
              className="tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium transition-all duration-300"
            >
              Limpar Filtros
            </Button>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
