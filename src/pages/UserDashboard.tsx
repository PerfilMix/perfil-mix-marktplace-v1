
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PurchasedAccountsSection from "@/components/dashboard/PurchasedAccountsSection";
import AntiInspectionProtection from "@/components/AntiInspectionProtection";
import Footer from "@/components/Footer";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import AppSidebar from "@/components/AppSidebar";
import SellerFinancialOverview from "@/components/seller/SellerFinancialOverview";
import SellerAccountsTable from "@/components/seller/SellerAccountsTable";
import AddSellerAccountForm from "@/components/seller/AddSellerAccountForm";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditProfileModal from "@/components/EditProfileModal";
import { SellerRequestBlock } from "@/components/SellerRequestBlock";

const UserDashboard = () => {
  
  // Estados locais primeiro
  const [activeSection, setActiveSection] = useState("purchases");
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Hooks de autenticação e dados
  const { user, userProfile, loading: authLoading } = useAuth();
  const { purchases, isLoading: isPurchasesLoading, error: purchasesError, refetch } = usePurchases();

  // Removed debug logging for performance

  // Handlers
  const handleAccountAdded = () => {
    setShowAddAccountForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleProfileUpdate = (newName: string, newImageUrl: string | null) => {
    // Profile updated successfully
  };

  // Redirecionamento para login se não autenticado
  useEffect(() => {
    if (!authLoading && (!user || !userProfile)) {
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, userProfile]);

  // Loading durante autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-tech-darker">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-tech-highlight mx-auto mb-4" />
            <p className="text-white">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não há usuário autenticado após loading
  if (!authLoading && (!user || !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tech-darker">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-white">Sessão inválida. Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    try {
      switch (activeSection) {
        case "profile":
          return (
            <div className="space-y-6">
              <UserProfileCard purchasesCount={purchases?.length || 0} />
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20"
              >
                Editar Perfil
              </Button>
            </div>
          );
        
        case "purchases":
          return (
            <PurchasedAccountsSection 
              purchases={purchases || []}
              isLoading={isPurchasesLoading}
              error={purchasesError}
              onRetry={refetch}
              isDesktop={true}
            />
          );
        
        case "seller-overview":
          return userProfile?.is_approved_seller ? (
            <SellerFinancialOverview />
          ) : (
            <SellerRequestBlock 
              userProfile={userProfile} 
              onRequestSubmitted={() => setRefreshKey(prev => prev + 1)} 
            />
          );
        
        case "seller-accounts":
          return userProfile?.is_approved_seller ? (
            <div key={refreshKey}>
              <SellerAccountsTable />
            </div>
          ) : (
            <SellerRequestBlock 
              userProfile={userProfile} 
              onRequestSubmitted={() => setRefreshKey(prev => prev + 1)} 
            />
          );
        
        case "cadastrar-conta":
          const isSellerBlocked = userProfile?.is_approved_seller && userProfile?.seller_sales_blocked;
          
          return userProfile?.is_approved_seller && !isSellerBlocked ? (
            <Card className="bg-tech-secondary border-tech-border">
              <CardHeader>
                <CardTitle className="text-white">Nova Conta para Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <AddSellerAccountForm
                  onSuccess={handleAccountAdded}
                  onCancel={() => setActiveSection("seller-accounts")}
                />
              </CardContent>
            </Card>
          ) : (
            <SellerRequestBlock 
              userProfile={userProfile} 
              onRequestSubmitted={() => setRefreshKey(prev => prev + 1)} 
            />
          );
        
        default:
          return (
            <div className="space-y-6">
              <DashboardHeader />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UserProfileCard purchasesCount={purchases?.length || 0} />
                <DashboardBanner />
              </div>
              <PurchasedAccountsSection 
                purchases={purchases || []}
                isLoading={isPurchasesLoading}
                error={purchasesError}
                onRetry={refetch}
                isDesktop={true}
              />
            </div>
          );
      }
    } catch (error) {
      console.error("UserDashboard - Erro ao renderizar conteúdo:", error);
      return (
        <div className="text-center text-white p-8">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p>Erro ao carregar conteúdo. Tente recarregar a página.</p>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-tech-darker">
        <AntiInspectionProtection level="strict" showToast={true} />
        <Navbar />

        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              purchasesCount={purchases?.length || 0}
            />
            
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto px-4 py-8">
                {/* Aviso importante sobre contas compradas */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-amber-100 font-medium mb-1">⚠️ Importante para contas compradas</p>
                      <p className="text-amber-200">
                        Após a compra, acesse imediatamente sua conta e altere as credenciais de login e senha. 
                        Para problemas, clique em "Reclamar" no card da conta. 
                        <span className="font-semibold text-amber-100"> Reclamações após 24h da compra não serão aceitas.</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <SidebarTrigger className="text-white hover:bg-tech-secondary" />
                  <h1 className="text-2xl font-bold text-white">
                    {activeSection === "profile" && "Meu Perfil"}
                    {activeSection === "purchases" && "Minhas Contas"}
                    {activeSection === "seller-overview" && "Visão Financeira"}
                    {activeSection === "seller-accounts" && "Minhas Contas para Venda"}
                    {activeSection === "cadastrar-conta" && "Cadastrar Conta"}
                    {activeSection === "dashboard" && "Dashboard"}
                  </h1>
                </div>
                
                {renderContent()}
              </div>
            </main>
          </div>
        </SidebarProvider>
        
        <Footer />
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentName={userProfile?.name || ""} 
        currentImage={userProfile?.profile_image_url || null} 
        userEmail={userProfile?.email || ""} 
        onProfileUpdate={handleProfileUpdate} 
      />
    </ErrorBoundary>
  );
};

export default UserDashboard;
