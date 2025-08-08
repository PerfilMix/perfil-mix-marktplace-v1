import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TikTokAccount } from "@/types";
import Navbar from "@/components/Navbar";
import PaymentButton from "@/components/PaymentButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatNumberWithK } from "@/lib/helpers";
import { useToast } from "@/components/ui/use-toast";
import { X, Loader2, RefreshCw, Info, Store, Users, Package, TrendingUp, Globe, CheckCircle, XCircle, ShoppingCart, ExternalLink, Image as ImageIcon, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SellerInfo from "@/components/SellerInfo";
import ImageViewer from "@/components/ImageViewer";
interface TextSettings {
  footer_company_name: string;
}
interface BrandingSettings {
  site_name: string;
}
const defaultTextSettings: TextSettings = {
  footer_company_name: "PerfilMix"
};
const defaultBrandingSettings: BrandingSettings = {
  site_name: "PerfilMix"
};
const BuyAccount = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [account, setAccount] = useState<TikTokAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [textSettings, setTextSettings] = useState<TextSettings>(defaultTextSettings);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(defaultBrandingSettings);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user
  } = useAuth();

  // Update meta tags for social sharing when account loads
  useEffect(() => {
    if (account && brandingSettings.site_name) {
      const updateMetaTags = () => {
        // Remove existing meta tags first to avoid conflicts
        const removeExistingMeta = (selector: string) => {
          const existing = document.querySelectorAll(selector);
          existing.forEach(meta => meta.remove());
        };

        // Create and append new meta tag
        const createMetaTag = (property: string, content: string, isName = false) => {
          const meta = document.createElement('meta');
          if (isName) {
            meta.setAttribute('name', property);
          } else {
            meta.setAttribute('property', property);
          }
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        };

        // Prepare content
        const title = `${account.nome} - ${brandingSettings.site_name}`;
        const description = account.plataforma === 'Shopify' ? `Loja Shopify com ${formatNumberWithK(account.clientes || 0)} clientes no nicho ${account.nicho}. Preço: ${formatCurrency(account.preco)}` : `Conta ${account.plataforma} com ${formatNumberWithK(account.seguidores)} seguidores no nicho ${account.nicho}. Preço: ${formatCurrency(account.preco)}`;

        // Use account screenshot if available, otherwise use default
        let imageUrl = account.account_screenshot_url;

        // If no screenshot, use default
        if (!imageUrl) {
          imageUrl = 'https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/PerfilMix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvUGVyZmlsTWl4LnBuZyIsImlhdCI6MTc1MDczMzY0NywiZXhwIjoyMDY2MDkzNjQ3fQ.xUA6g87KMF1QEzT86gICa2nRjK-X8LiYbHn2k-8xDDI';
        }

        // Add cache busting for better social media sharing
        const imageUrlWithCacheBust = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'v=' + Date.now();
        const currentUrl = window.location.href;

        // Remove existing Open Graph and Twitter meta tags
        removeExistingMeta('meta[property^="og:"]');
        removeExistingMeta('meta[name^="twitter:"]');
        removeExistingMeta('meta[name="description"]');

        // Create new Open Graph meta tags
        createMetaTag('og:title', title);
        createMetaTag('og:description', description);
        createMetaTag('og:image', imageUrlWithCacheBust);
        createMetaTag('og:image:width', '1200');
        createMetaTag('og:image:height', '630');
        createMetaTag('og:image:type', 'image/png');
        createMetaTag('og:url', currentUrl);
        createMetaTag('og:type', 'website');
        createMetaTag('og:site_name', brandingSettings.site_name);
        createMetaTag('og:locale', 'pt_BR');

        // Create new Twitter Card meta tags
        createMetaTag('twitter:card', 'summary_large_image', true);
        createMetaTag('twitter:title', title, true);
        createMetaTag('twitter:description', description, true);
        createMetaTag('twitter:image', imageUrlWithCacheBust, true);
        createMetaTag('twitter:image:width', '1200', true);
        createMetaTag('twitter:image:height', '630', true);
        createMetaTag('twitter:site', '@perfilmix', true);

        // Additional meta tags
        createMetaTag('description', description, true);
        createMetaTag('author', brandingSettings.site_name, true);

        // Update page title
        document.title = title;
        console.log('Meta tags updated with account info:', {
          title,
          description,
          imageUrl: imageUrlWithCacheBust,
          originalImageUrl: imageUrl,
          currentUrl,
          hasScreenshot: !!account.account_screenshot_url
        });
      };

      // Update immediately
      updateMetaTags();

      // Also update after a small delay to ensure DOM is ready
      setTimeout(updateMetaTags, 500);
    }
    return () => {
      // Reset to default when component unmounts
      const resetMetaTags = () => {
        const defaultImage = 'https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/PerfilMix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvUGVyZmlsTWl4LnBuZyIsImlhdCI6MTc1MDczMzY0NywiZXhwIjoyMDY2MDkzNjQ3fQ.xUA6g87KMF1QEzT86gICa2nRjK-X8LiYbHn2k-8xDDI';
        const updateMeta = (selector: string, content: string) => {
          const meta = document.querySelector(selector);
          if (meta) meta.setAttribute('content', content);
        };
        updateMeta('meta[property="og:image"]', defaultImage);
        updateMeta('meta[name="twitter:image"]', defaultImage);
        updateMeta('meta[property="og:title"]', brandingSettings.site_name);
        updateMeta('meta[property="og:description"]', 'Marketplace de contas verificadas');
        updateMeta('meta[name="twitter:title"]', brandingSettings.site_name);
        updateMeta('meta[name="twitter:description"]', 'Marketplace de contas verificadas');
        document.title = `${brandingSettings.site_name} | Contas`;
      };
      setTimeout(resetMetaTags, 100);
    };
  }, [account, brandingSettings.site_name]);

  // Preload account data cache
  const accountCache = new Map();

  // Fetch site settings
  useEffect(() => {
    const fetchTextSettings = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('site_settings').select('key, value').eq('type', 'text').eq('active', true).in('key', ['footer_company_name']);
        if (error) {
          throw error;
        }
        let updatedSettings = {
          ...defaultTextSettings
        };
        data?.forEach(item => {
          if (item.key in updatedSettings && item.value) {
            updatedSettings = {
              ...updatedSettings,
              [item.key]: item.value
            };
          }
        });
        setTextSettings(updatedSettings);
      } catch (error) {
        console.error('Error fetching text settings:', error);
      }
    };
    const fetchBrandingSettings = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('site_settings').select('key, value').eq('type', 'branding').eq('active', true).in('key', ['site_name']);
        if (error) {
          throw error;
        }
        let updatedSettings = {
          site_name: "Accont X"
        };
        data?.forEach(item => {
          if (item.key === 'site_name' && item.value) {
            updatedSettings.site_name = item.value;
          }
        });
        setBrandingSettings(updatedSettings);
      } catch (error) {
        console.error('Error fetching branding settings:', error);
      }
    };
    fetchTextSettings();
    fetchBrandingSettings();

    // Set up listeners for site settings changes
    const channel = supabase.channel('buy-account-settings-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'site_settings'
    }, () => {
      fetchTextSettings();
      fetchBrandingSettings();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper function to get account initials for avatar fallback
  const getAccountInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Fetch account details with caching and optimization
  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!id) return;

      // Check cache first
      const cached = accountCache.get(id);
      if (cached && Date.now() - cached.timestamp < 60000) {
        // 1 minute cache
        setAccount(cached.data);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setHasTimedOut(false);

      // Reduced timeout to 3 seconds for better UX
      const timeoutId = setTimeout(() => {
        setHasTimedOut(true);
      }, 3000);
      try {
        // Updated query to include all Shopify fields
        const {
          data,
          error
        } = await supabase.from('accounts').select('*').eq('id', id).maybeSingle();
        if (error) {
          throw error;
        }
        if (data) {
          const accountData = data as TikTokAccount;
          setAccount(accountData);

          // Cache the result
          accountCache.set(id, {
            data: accountData,
            timestamp: Date.now()
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Conta não encontrada."
          });
          navigate("/");
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os detalhes da conta."
        });
        navigate("/");
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };
    fetchAccountDetails();
  }, [id, navigate, toast]);
  const handleClose = () => {
    navigate("/", {
      replace: true
    });
  };
  const getPlatformUrl = (platform: string) => {
    const urls: {
      [key: string]: string;
    } = {
      "TikTok": "https://www.tiktok.com/",
      "YouTube": "https://www.youtube.com/",
      "Instagram": "https://www.instagram.com/",
      "Facebook": "https://www.facebook.com/",
      "Kwai": "https://www.kwai.com/",
      "Shopify": "https://accounts.shopify.com/"
    };
    return urls[platform] || "https://www.tiktok.com/";
  };
  const handleOpenPlatform = () => {
    if (account) {
      const url = getPlatformUrl(account.plataforma);
      window.open(url, "_blank");
    }
  };

  // Helper function to get display nicho
  const getDisplayNicho = (account: TikTokAccount) => {
    if (account.nicho === 'Outros' && account.nicho_customizado) {
      return account.nicho_customizado;
    }
    return account.nicho;
  };

  // Helper function to get engagement badge color
  const getEngajamentoBadgeClass = (engajamento: string) => {
    switch (engajamento) {
      case 'Alto':
        return 'bg-emerald-600';
      case 'Médio':
        return 'bg-blue-600';
      case 'Baixo':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };
  const handleReload = () => {
    window.location.href = "/";
  };

  // Copy account info function
  const handleCopyAccountInfo = async () => {
    if (!account) return;
    const currentUrl = window.location.href;
    const shareText = account.plataforma === 'Shopify' ? `🛒 *${account.nome}*\n\n` + `💲 *Preço:* ${formatCurrency(account.preco)}\n` + `👤 *Clientes:* ${formatNumberWithK(account.clientes || 0)}\n` + `💼 *Nicho:* ${account.nicho === 'Outros' && account.nicho_customizado ? account.nicho_customizado : account.nicho}\n` + `🌍 *País:* ${account.pais}\n` + `📋 *Produtos:* ${account.produtos_cadastrados || 0}\n` + `💳 *Vendas Mensais:* ${account.vendas_mensais || 'Não informado'}\n` + `🏢 *Loja Pronta:* ${account.loja_pronta ? 'Sim' : 'Não'}\n` + `🌐 *Domínio Incluso:* ${account.dominio_incluso ? 'Sim' : 'Não'}\n\n` + `🔗 Ver loja: ${currentUrl}` : `📱 *${account.nome}*\n\n` + `💲 *Preço:* ${formatCurrency(account.preco)}\n` + `👥 *Seguidores:* ${formatNumberWithK(account.seguidores)}\n` + `💼 *Nicho:* ${account.nicho === 'Outros' && account.nicho_customizado ? account.nicho_customizado : account.nicho}\n` + `🌍 *País:* ${account.pais}\n` + `📈 *Engajamento:* ${account.engajamento}\n` + `💰 *Monetizada:* ${account.monetizada || 'Não'}\n` + (account.plataforma === 'TikTok' ? `🛒 *TikTok Shop:* ${account.tiktok_shop}\n` : '') + `\n🔗 Ver conta: ${currentUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        description: "Informações da conta copiadas para a área de transferência!",
        duration: 2000
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erro ao copiar informações"
      });
    }
  };
  if (isLoading) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            {!hasTimedOut ? <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Carregando...</h2>
              </> : <>
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-tech-warning" />
                <h2 className="text-2xl font-bold mb-4">Carregamento demorado</h2>
                <p className="text-gray-600 mb-6">
                  O carregamento está demorando mais que o esperado. Tente atualizar a página.
                </p>
                <Button onClick={handleReload} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar página
                </Button>
              </>}
          </div>
        </div>
      </div>;
  }
  if (!account) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Conta não encontrada</h2>
            <Button onClick={() => navigate("/")} className="mt-4">
              Voltar para a página inicial
            </Button>
          </div>
        </div>
      </div>;
  }

  // Check if account is already sold
  if (account && account.status === 'vendido') {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">
              {account.plataforma === 'Shopify' ? 'Loja já vendida' : 'Conta já vendida'}
            </h2>
            <p className="mt-2 mb-4">
              {account.plataforma === 'Shopify' ? 'Esta loja não está mais disponível para compra.' : 'Esta conta não está mais disponível para compra.'}
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              {account.plataforma === 'Shopify' ? 'Explorar outras lojas' : 'Explorar outras contas'}
            </Button>
          </div>
        </div>
      </div>;
  }
  const isShopify = account?.plataforma === 'Shopify';
  const isPurchasedByUser = account?.comprada_por === user?.id && account?.status === 'vendido';
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <Card className="glass-card overflow-hidden bg-tech-card text-white">
            <CardHeader className="bg-gradient-to-r from-tech-card to-tech-darker pb-2 pt-4 px-6">
              <div className="flex justify-between items-start">
                <div>
                  
                  <h2 className="text-2xl font-bold text-white">{account.nome}</h2>
                </div>
                <div className="flex space-x-2">
                  <Badge className="bg-tech-accent">{account.pais}</Badge>
                  <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 px-6">
              {isShopify ?
            // Shopify-specific layout
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Detalhes da Loja
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plataforma:</span>
                        <Badge className="bg-purple-600">Shopify</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Clientes:</span>
                        <span className="font-semibold flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {formatNumberWithK(account.clientes || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Produtos:</span>
                        <span className="font-semibold flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {account.produtos_cadastrados || 0}
                        </span>
                      </div>
                      {account.vendas_mensais && <div className="flex justify-between">
                          <span className="text-gray-400">Vendas Mensais:</span>
                          <span className="font-semibold">{account.vendas_mensais}</span>
                        </div>}
                      {account.trafego_mensal && <div className="flex justify-between">
                          <span className="text-gray-400">Tráfego Mensal:</span>
                          <span className="font-semibold flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {account.trafego_mensal}
                          </span>
                        </div>}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nicho:</span>
                        <span className="font-semibold">{getDisplayNicho(account)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">País:</span>
                        <span className="font-semibold">{account.pais}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4">Informações de Preço</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Preço:</span>
                        <span className="font-bold text-tech-highlight text-xl">
                          {formatCurrency(account.preco)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disponibilidade:</span>
                        <Badge className="bg-green-600">Disponível</Badge>
                      </div>
                      
                      {/* Screenshot da Conta */}
                      {account.account_screenshot_url && <div className="mt-4">
                          <span className="text-gray-400 text-sm block mb-2">Screenshot da Conta:</span>
                          <div className="cursor-pointer border border-tech-border rounded-lg p-2 bg-tech-darker hover:bg-tech-secondary transition-colors" onClick={() => setShowImageViewer(true)}>
                            <img src={account.account_screenshot_url} alt="Screenshot da conta" className="w-full h-32 object-cover rounded" />
                            <p className="text-xs text-gray-400 mt-1 text-center">Clique para ampliar</p>
                          </div>
                        </div>}
                    </div>

                    {/* Características da Loja */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 text-tech-highlight">Características</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Domínio Incluso:</span>
                          <div className="flex items-center">
                            {account.dominio_incluso ? <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-500">Sim</span>
                              </> : <>
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-red-500">Não</span>
                              </>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Loja Pronta:</span>
                          <div className="flex items-center">
                            {account.loja_pronta ? <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-500">Sim</span>
                              </> : <>
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-red-500">Não</span>
                              </>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {account.integracoes_ativas && <div className="mt-4">
                        <h4 className="font-semibold mb-2 text-tech-highlight">Integrações Ativas</h4>
                        <p className="text-sm text-gray-300">{account.integracoes_ativas}</p>
                      </div>}
                  </div>
                </div> :
            // Original social media layout
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {/* Informações de Preço movidas para cima */}
                    <h3 className="text-xl font-bold mb-4">Informações de Preço</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Preço:</span>
                        <span className="font-bold text-xl text-green-500">
                          {formatCurrency(account.preco)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">País:</span>
                        <span className="font-semibold">{account.pais}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disponibilidade:</span>
                        <Badge className="bg-green-600">Disponível</Badge>
                      </div>
                    </div>

                    {/* Detalhes da Conta agora embaixo */}
                    <h3 className="text-xl font-bold mb-4">Detalhes da Conta</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plataforma:</span>
                        <span className="font-semibold">{account.plataforma}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monetizada:</span>
                        <span className="font-semibold">{(account as any).monetizada || "Não"}</span>
                      </div>
                      {account.plataforma === 'TikTok' && <div className="flex justify-between">
                          <span className="text-gray-400">TikTok Shop:</span>
                          <span className="font-semibold">{account.tiktok_shop}</span>
                        </div>}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Seguidores:</span>
                        <span className="font-semibold">{formatNumberWithK(account.seguidores)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Engajamento:</span>
                        <Badge className={getEngajamentoBadgeClass(account.engajamento)}>
                          {account.engajamento}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nicho:</span>
                        <span className="font-semibold">{getDisplayNicho(account)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">País:</span>
                        <span className="font-semibold">{account.pais}</span>
                      </div>
                    </div>
                  </div>
                  
                   <div>
                     {/* Screenshot da Conta alinhado com as informações */}
                      {account.account_screenshot_url && <div className="py-0 my-[21px]">
                          <h3 className="text-xl font-bold mb-4">Screenshot da Conta</h3>
                          <div onClick={() => setShowImageViewer(true)} className="cursor-pointer border border-tech-border rounded-lg overflow-hidden bg-tech-darker hover:bg-tech-secondary transition-colors">
                            <img src={account.account_screenshot_url} alt="Screenshot da conta" className="w-full h-80 object-cover object-top" />
                            <p className="text-xs text-gray-400 py-2 text-center">Clique para ampliar</p>
                          </div>
                        </div>}
                   </div>
                </div>}
              
              {/* Description section */}
              <div className="mt-6 bg-tech-darker p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-3">
                  {isShopify ? 'Sobre esta loja' : 'Sobre esta conta'}
                </h3>
                {isShopify && account.descricao_loja ? <p className="text-gray-300">{account.descricao_loja}</p> : isShopify ? <p className="text-gray-300">
                    Esta é uma loja Shopify no nicho de {getDisplayNicho(account).toLowerCase()} com {formatNumberWithK(account.clientes || 0)} clientes cadastrados.
                    {account.loja_pronta && ' A loja está pronta para rodar e começar a vender imediatamente.'}
                    {account.dominio_incluso && ' Inclui domínio personalizado.'}
                    {' '}Após a compra, você receberá as credenciais de acesso e instruções para transferência da loja.
                  </p> : <p className="text-gray-300">
                    Esta é uma conta {account.plataforma} autêntica no nicho de {getDisplayNicho(account).toLowerCase()} com {formatNumberWithK(account.seguidores)} seguidores e engajamento {account.engajamento.toLowerCase()}.
                    {account.plataforma === 'TikTok' && account.tiktok_shop === 'Sim' && ' Esta conta possui TikTok Shop habilitado, permitindo vendas diretas na plataforma.'}
                    {' '}Após a compra, você receberá as credenciais de acesso diretamente no seu painel.
                   </p>}
               </div>

               {/* Seller Info - Discrete section */}
               <SellerInfo vendedorId={account.vendedor_id} className="mt-4" />

              {/* Show credentials only for purchased accounts */}
              {isPurchasedByUser && <div className="mt-6 border border-tech-accent/30 rounded-lg p-4 bg-tech-darker/50 backdrop-blur-sm">
                  <h4 className="font-semibold mb-3 text-center text-tech-highlight">
                    Credenciais de acesso
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 px-3 bg-tech-card rounded-lg border border-tech-accent/20">
                      <span className="text-gray-300 text-sm sm:text-base">Login:</span>
                      <div className="bg-tech-darker rounded overflow-hidden flex-1 sm:flex-initial sm:min-w-0">
                        <code className="block px-2 sm:px-3 py-1 text-xs sm:text-sm text-tech-highlight font-mono whitespace-nowrap overflow-x-auto">
                          {account.login}
                        </code>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 px-3 bg-tech-card rounded-lg border border-tech-accent/20">
                      <span className="text-gray-300 text-sm sm:text-base">Senha:</span>
                      <div className="bg-tech-darker rounded overflow-hidden flex-1 sm:flex-initial sm:min-w-0">
                        <code className="block px-2 sm:px-3 py-1 text-xs sm:text-sm text-tech-highlight font-mono whitespace-nowrap overflow-x-auto">
                          {account.senha}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Platform redirect button */}
                  <div className="mt-4 flex justify-center">
                    <Button onClick={handleOpenPlatform} className="tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium px-6 py-2 transition-all duration-300">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir {account.plataforma}
                    </Button>
                  </div>
                </div>}
              
              {!isAuthenticated && <div className="mt-6 p-4 border border-blue-500 bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-300 flex items-center mb-2">
                    <Info className="h-5 w-5 mr-2" />
                    Login Necessário para Compra
                  </h4>
                  <p className="text-sm text-blue-200">
                    Para comprar esta {isShopify ? 'loja' : 'conta'}, você precisa fazer login ou criar uma conta. O processo é rápido e seguro.
                  </p>
                </div>}
              
              <div className="mt-6 p-4 border border-blue-700 bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-300 flex items-center mb-2">
                  <Info className="h-5 w-5 mr-2" />
                  Processo de Compra
                </h4>
                <div className="text-sm text-blue-200 space-y-1">
                  {!isAuthenticated && <p>1. Faça login ou crie uma conta</p>}
                  <p>{!isAuthenticated ? '2.' : '1.'} Clique no botão de compra para ser redirecionado ao Pagamento</p>
                  <p>{!isAuthenticated ? '3.' : '2.'} Complete o pagamento com segurança</p>
                  <p>{!isAuthenticated ? '4.' : '3.'} Receba confirmação e credenciais da {isShopify ? 'loja' : 'conta'}</p>
                  <p>{!isAuthenticated ? '5.' : '4.'} Suporte completo para transferência da {isShopify ? 'loja' : 'conta'}</p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 bg-tech-darker pt-6 px-6 pb-6">
              <PaymentButton accountId={account.id} accountName={account.nome} price={account.preco} currency="BRL" disabled={!isAuthenticated} isAccountSold={false} />
              
              {/* Botões lado a lado */}
              <div className="flex gap-3 w-full md:justify-center">
                <Button variant="outline" className="flex-1 md:flex-none md:w-40 border-tech-accent/50 text-tech-highlight hover:bg-tech-accent/20 hover:text-white hover:border-tech-highlight transition-all duration-300" onClick={() => navigate("/")}>Voltar</Button>
                
                <Button variant="outline" className="flex-1 md:flex-none md:w-48 border-tech-accent/50 text-tech-highlight hover:bg-tech-accent/20 hover:text-white hover:border-tech-highlight transition-all duration-300" onClick={handleCopyAccountInfo}>
                  <Copy className="h-4 w-4 mr-2" />
                  Compartilhar Link
                </Button>
              </div>
              
              <p className="text-sm text-center text-gray-400">
                Pagamento seguro | Em caso de dúvidas chame o Suporte.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-tech-card border-t border-tech-accent/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {textSettings.footer_company_name || brandingSettings.site_name}. Todos os direitos reservados.</p>
        </div>
      </footer>
      
      {/* Image Viewer Modal */}
      <ImageViewer imageUrl={account?.account_screenshot_url || null} isOpen={showImageViewer} onClose={() => setShowImageViewer(false)} title="Screenshot da Conta" hideKeyboardShortcuts={true} hideDownload={true} />

    </div>;
};
export default BuyAccount;