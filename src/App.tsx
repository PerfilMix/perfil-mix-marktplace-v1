
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SystemColorsProvider } from "./hooks/useSystemColors";

// Componentes principais carregados imediatamente
import Index from "./pages/Index";
import Login from "./pages/Login";
import Landing from "./pages/Landing";

// Lazy loading para páginas menos críticas
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AdminProtectedRoute = lazy(() => import("./components/AdminProtectedRoute"));
const AntiInspectionProtection = lazy(() => import("./components/AntiInspectionProtection"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const BuyAccount = lazy(() => import("./pages/BuyAccount"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const ComoComprar = lazy(() => import("./pages/ComoComprar"));
const TermosVendedores = lazy(() => import("./pages/TermosVendedores"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (novo nome do cacheTime)
    },
  },
});

// Componente de loading rápido
const QuickLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-tech-darker">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-tech-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SystemColorsProvider>
      <TooltipProvider>
        <Suspense fallback={<QuickLoader />}>
          <AntiInspectionProtection level="medium" showToast={false} />
        </Suspense>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<QuickLoader />}>
            <ScrollToTop />
          </Suspense>
          <Routes>
            {/* Marketplace público - página inicial */}
            <Route path="/" element={<Index />} />
            
            {/* Página de boas-vindas */}
            <Route path="/welcome" element={<Landing />} />
            
            {/* Painel do usuário protegido */}
            <Route path="/dashboard" element={
              <Suspense fallback={<QuickLoader />}>
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              </Suspense>
            } />
            
            {/* Dashboard do vendedor */}
            <Route path="/vendedor" element={
              <Suspense fallback={<QuickLoader />}>
                <ProtectedRoute>
                  <SellerDashboard />
                </ProtectedRoute>
              </Suspense>
            } />
            
            {/* Redirecionamento do dashboard antigo */}
            <Route path="/minha-conta" element={<Navigate to="/dashboard" replace />} />
            
            {/* Páginas de autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={
              <Suspense fallback={<QuickLoader />}>
                <AdminLogin />
              </Suspense>
            } />
            
            {/* Página de redefinição de senha */}
            <Route path="/reset-password" element={
              <Suspense fallback={<QuickLoader />}>
                <ResetPassword />
              </Suspense>
            } />
            
            {/* Painel administrativo */}
            <Route path="/admin" element={
              <Suspense fallback={<QuickLoader />}>
                <AdminProtectedRoute>
                  <AdminPanel />
                </AdminProtectedRoute>
              </Suspense>
            } />
            
            {/* Compra de contas */}
            <Route path="/comprar/:id" element={
              <Suspense fallback={<QuickLoader />}>
                <BuyAccount />
              </Suspense>
            } />
            
            {/* Nova página de checkout */}
            <Route path="/checkout/:id" element={
              <Suspense fallback={<QuickLoader />}>
                <Checkout />
              </Suspense>
            } />
            
            {/* Página de sucesso do pagamento */}
            <Route path="/payment-success" element={
              <Suspense fallback={<QuickLoader />}>
                <PaymentSuccess />
              </Suspense>
            } />
            
            {/* Páginas institucionais */}
            <Route path="/termos-de-uso" element={
              <Suspense fallback={<QuickLoader />}>
                <TermosDeUso />
              </Suspense>
            } />
            <Route path="/politica-de-privacidade" element={
              <Suspense fallback={<QuickLoader />}>
                <PoliticaPrivacidade />
              </Suspense>
            } />
            <Route path="/como-comprar" element={
              <Suspense fallback={<QuickLoader />}>
                <ComoComprar />
              </Suspense>
            } />
            <Route path="/termos-vendedores" element={
              <Suspense fallback={<QuickLoader />}>
                <TermosVendedores />
              </Suspense>
            } />
            
            {/* Página 404 */}
            <Route path="*" element={
              <Suspense fallback={<QuickLoader />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
          
        </BrowserRouter>
      </TooltipProvider>
    </SystemColorsProvider>
  </QueryClientProvider>
);

export default App;
