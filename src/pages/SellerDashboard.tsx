import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Plus, XCircle, Clock, CheckCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isDesktop } from "@/lib/helpers";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import Footer from "@/components/Footer";
import AntiInspectionProtection from "@/components/AntiInspectionProtection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddSellerAccountForm from "@/components/seller/AddSellerAccountForm";
import SellerAccountsTable from "@/components/seller/SellerAccountsTable";
import SellerFinancialOverview from "@/components/seller/SellerFinancialOverview";
import SellerRatingsOverview from "@/components/seller/SellerRatingsOverview";
import WithdrawalRequest from "@/components/WithdrawalRequest";

const SellerDashboard = () => {
  const [isDesktopView, setIsDesktopView] = useState(isDesktop());
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sellerRequest, setSellerRequest] = useState<any>(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const { user, userProfile, loading } = useAuth();
  
  // Verificar se o vendedor está bloqueado (só considera bloqueado se for vendedor aprovado E estiver com vendas bloqueadas)
  const isSellerBlocked = userProfile?.is_approved_seller && userProfile?.seller_sales_blocked;

  // Buscar solicitação de vendedor do usuário
  useEffect(() => {
    const fetchSellerRequest = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('seller_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar solicitação:', error);
        } else if (data) {
          setSellerRequest(data);
        }
      } catch (error) {
        console.error('Erro ao buscar solicitação:', error);
      } finally {
        setRequestLoading(false);
      }
    };

    fetchSellerRequest();
  }, [user?.id]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(isDesktop());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAccountAdded = () => {
    setShowAddAccountForm(false);
    // Força atualização da tabela de contas
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-tech-darker">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-tech-highlight mx-auto mb-4" />
            <p className="text-white">Carregando dashboard do vendedor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tech-darker">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-white">Acesso negado. Faça login para continuar.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-tech-darker">
        <AntiInspectionProtection level="strict" showToast={true} />
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 flex-grow">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Dashboard do Vendedor
              </h1>
              <p className="text-tech-light">
                Bem-vindo, {userProfile.name || user.email}
              </p>
            </div>
            <Badge 
              variant="secondary" 
              className={isSellerBlocked 
                ? "bg-red-500/20 text-red-400 border-red-400" 
                : "bg-tech-secondary/20 text-tech-highlight"
              }
            >
              {isSellerBlocked ? "Vendedor Bloqueado" : "Vendedor Ativo"}
            </Badge>
          </div>

          {/* Financial Overview */}
          <SellerFinancialOverview />

          {/* Withdrawal Request Section - only for approved sellers who aren't blocked */}
          {userProfile?.is_approved_seller && !isSellerBlocked && (
            <WithdrawalRequest 
              onRequestSubmitted={() => setRefreshKey(prev => prev + 1)} 
            />
          )}

          {/* Status da Solicitação de Vendedor */}
          {!requestLoading && sellerRequest && sellerRequest.status === 'rejected' && (
            <Card className="bg-red-500/10 border-red-500/30 mb-8" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <XCircle className="h-8 w-8 text-red-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-red-400 mb-2">
                      Solicitação para Vendedor Rejeitada
                    </h3>
                    <p className="text-red-300 mb-3">
                      Sua solicitação para se tornar vendedor foi analisada e rejeitada.
                    </p>
                    
                    {sellerRequest.admin_observacoes && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Observações do Administrador
                        </h4>
                        <p className="text-red-300 text-sm">
                          {sellerRequest.admin_observacoes}
                        </p>
                      </div>
                    )}
                    
                    {sellerRequest.reviewed_at && (
                      <p className="text-red-400 text-sm">
                        Rejeitada em: {new Date(sellerRequest.reviewed_at).toLocaleDateString('pt-BR')} às {new Date(sellerRequest.reviewed_at).toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!requestLoading && sellerRequest && sellerRequest.status === 'pending' && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 mb-8" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                      Solicitação em Análise
                    </h3>
                    <p className="text-yellow-300 mb-3">
                      Sua solicitação para se tornar vendedor está sendo analisada pela nossa equipe.
                    </p>
                    <p className="text-yellow-400 text-sm">
                      Enviada em: {new Date(sellerRequest.created_at).toLocaleDateString('pt-BR')} às {new Date(sellerRequest.created_at).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!requestLoading && sellerRequest && sellerRequest.status === 'approved' && !userProfile?.is_approved_seller && (
            <Card className="bg-green-500/10 border-green-500/30 mb-8" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-400 mb-2">
                      Solicitação Aprovada
                    </h3>
                    <p className="text-green-300 mb-3">
                      Parabéns! Sua solicitação para se tornar vendedor foi aprovada.
                    </p>
                    {sellerRequest.reviewed_at && (
                      <p className="text-green-400 text-sm">
                        Aprovada em: {new Date(sellerRequest.reviewed_at).toLocaleDateString('pt-BR')} às {new Date(sellerRequest.reviewed_at).toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isSellerBlocked && (
            <Card className="bg-red-500/10 border-red-500/30 mb-8" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-400 mb-2">
                  Bloqueado Temporariamente para Análise
                </h3>
                <p className="text-red-300">
                  Qualquer dúvida entre em contato com o suporte
                </p>
              </CardContent>
            </Card>
          )}

          <Separator className="my-8 bg-tech-border" />

          {/* Tabs for different sections */}
          <Tabs defaultValue="ratings" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ratings">Avaliações</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="ratings" className="space-y-6">
              <SellerRatingsOverview sellerId={user?.id} />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-tech-secondary border-tech-border">
                <CardHeader>
                  <CardTitle className="text-white">Perfil do Vendedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-tech-light text-sm">Email</label>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-tech-light text-sm">Nome</label>
                    <p className="text-white font-medium">
                      {userProfile.name || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <label className="text-tech-light text-sm">Data de Cadastro</label>
                    <p className="text-white font-medium">
                      Data não disponível
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default SellerDashboard;
