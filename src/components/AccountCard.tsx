import { TikTokAccount } from "@/types";
import { formatCurrency, formatNumberWithK, getPaisColor, getPlatformStyle } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Copy, Users, Brain, DollarSign, Store, Package, TrendingUp, ExternalLink, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, memo } from "react";
import PaymentButton from "@/components/PaymentButton";
import ImageViewer from "@/components/ImageViewer";
interface AccountCardProps {
  account: TikTokAccount;
  showCredentials?: boolean;
  isDesktop?: boolean;
  showEngagement?: boolean;
}
const AccountCard = memo(({
  account,
  showCredentials = false,
  isDesktop = false,
  showEngagement = true
}: AccountCardProps) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} copiado para a área de transferência!`,
      duration: 2000
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
    const url = getPlatformUrl(account.plataforma);
    window.open(url, "_blank");
  };
  const platformStyle = getPlatformStyle(account.plataforma);
  const paisColor = getPaisColor(account.pais);
  const isShopify = account.plataforma === "Shopify";
  return <Card className="glass-card overflow-hidden hover:shadow-xl hover:shadow-tech-highlight/5 transition-all duration-300 border-tech-accent/20 bg-tech-card/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-tech-accent/10 to-tech-highlight/10 pb-4 border-b border-tech-accent/20 px-[3px] mx-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white px-0 leading-tight">{account.nome}</h3>
          </div>
          
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 lg:pt-6 bg-tech-card mx-0 lg:px-6 px-[4px]">
        {/* Screenshot da Conta - Topo no Mobile */}
        {account.account_screenshot_url && !showCredentials && <div className="lg:hidden mb-4">
            <div className="relative group">
              <img src={account.account_screenshot_url} alt={`Screenshot da conta ${account.nome}`} className="w-full h-48 object-cover object-top cursor-pointer hover:opacity-90 transition-all duration-300 rounded-lg" onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setShowImageViewer(true);
          }} />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg cursor-pointer" onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setShowImageViewer(true);
          }}>
                <div className="bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium pointer-events-none">
                  Clique para ampliar
                </div>
              </div>
            </div>
          </div>}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-2">
          {/* Informações da Conta */}
          <div className="flex-1 space-y-3 lg:space-y-6">
            {/* Informações de Preço */}
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center py-2 bg-tech-darker/50 rounded-lg border border-tech-accent/10 px-3 lg:px-6 mx-[5px]">
                <span className="text-gray-300 font-medium whitespace-nowrap">
                  País: <span className="text-white font-medium">{account.pais}</span>
                </span>
              </div>
            </div>

            {/* Detalhes da Conta */}
            <div className="space-y-2 lg:space-y-3">
              <div className="flex justify-between items-center py-2 px-3 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10">
                <span className="text-gray-300 font-medium">Local:</span>
                <Badge variant="outline" className="border font-medium px-3 py-1" style={{
                borderColor: platformStyle.color,
                color: platformStyle.color,
                backgroundColor: `${platformStyle.color}20`
              }}>
                  {account.plataforma}
                </Badge>
              </div>

              {account.plataforma === "TikTok" && <div className="flex justify-between items-center py-2 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10 px-[16px]">
                  <span className="text-gray-300 font-medium">Monetizada:</span>
                  <span className="text-white font-medium">{account.monetizada || "Não"}</span>
                </div>}

              {account.plataforma === "TikTok" && <div className="flex justify-between items-center py-2 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10 px-[14px]">
                  <span className="text-gray-300 font-medium">TikTok Shop:</span>
                  <span className="text-white font-medium">{account.tiktok_shop || "Não"}</span>
                </div>}

              {isShopify && <div className="flex justify-between items-center py-2 px-3 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10">
                  <span className="text-gray-300 font-medium">TikTok Shop:</span>
                  <span className="text-white font-medium">Não</span>
                </div>}

              <div className="flex justify-between items-center py-2 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10 px-[19px]">
                <span className="text-gray-300 font-medium">
                  {isShopify ? "Clientes:" : "Seguidores:"}
                </span>
                <span className="font-bold text-white text-lg">
                  {isShopify ? formatNumberWithK(account.clientes || 0) : formatNumberWithK(account.seguidores)}
                </span>
              </div>

              {!isShopify && showEngagement && <div className="flex justify-between items-center py-2 px-3 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10">
                  <span className="text-gray-300 font-medium">Engajamento:</span>
                  <Badge className={`px-3 py-1 font-medium ${account.engajamento === 'Alto' ? 'bg-emerald-600' : account.engajamento === 'Médio' ? 'bg-blue-600' : 'bg-red-600'}`}>
                    {account.engajamento || "Médio"}
                  </Badge>
                </div>}

              <div className="flex justify-between items-center py-2 px-3 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10">
                <span className="text-gray-300 font-medium">Nicho:</span>
                <Badge className="bg-blue-600 text-white border-blue-600 px-3 py-1 font-medium" style={{
                backgroundColor: '#2563eb'
              }}>
                  {account.nicho}
                </Badge>
              </div>

              {isShopify && account.produtos_cadastrados && <div className="flex justify-between items-center py-2 px-3 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10">
                  <span className="text-gray-300 font-medium">Produtos:</span>
                  <span className="font-bold text-white text-lg">
                    {account.produtos_cadastrados}
                  </span>
                </div>}

              {isShopify && account.vendas_mensais && <div className="flex justify-between items-center py-2 px-3 lg:px-6 bg-tech-darker/50 rounded-lg border border-tech-accent/10">
                  <span className="text-gray-300 font-medium">Vendas Mensais:</span>
                  <span className="font-bold text-white text-sm">
                    {account.vendas_mensais}
                  </span>
                </div>}
            </div>
          </div>

          {/* Screenshot da Conta - Lado Direito no Desktop */}
          {account.account_screenshot_url && !showCredentials && <div className="hidden lg:block w-full lg:w-80 flex-shrink-0 space-y-3 pr-3">
              <div className="relative group">
                <img src={account.account_screenshot_url} alt={`Screenshot da conta ${account.nome}`} className="w-full h-80 object-cover object-top cursor-pointer hover:opacity-90 transition-all duration-300 rounded-lg" onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setShowImageViewer(true);
            }} />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg cursor-pointer" onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setShowImageViewer(true);
            }}>
                  <div className="bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium pointer-events-none">
                    Clique para ampliar
                  </div>
                </div>
              </div>
            </div>}
        </div>

        {isShopify && (account.dominio_incluso || account.loja_pronta) && <div className="mt-4 border border-tech-accent/30 rounded-lg p-4 bg-tech-darker/50 backdrop-blur-sm">
            <h4 className="font-semibold mb-3 text-center text-tech-highlight">Características</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {account.dominio_incluso && <Badge className="bg-green-600 text-white">Domínio Incluso</Badge>}
              {account.loja_pronta && <Badge className="bg-blue-600 text-white">Loja Pronta</Badge>}
            </div>
          </div>}
        
        {showCredentials && <div className="mt-4 border border-tech-accent/30 rounded-lg p-4 bg-tech-darker/50 backdrop-blur-sm">
            <h4 className="font-semibold mb-3 text-center text-tech-highlight">
              Credenciais de acesso
            </h4>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 px-3 bg-tech-card rounded-lg border border-tech-accent/20">
                <span className="text-gray-300 text-sm sm:text-base">Login:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-tech-darker rounded overflow-hidden flex-1 min-w-0">
                    <code className="block px-2 sm:px-3 py-1 text-xs sm:text-sm text-tech-highlight font-mono whitespace-nowrap overflow-x-auto">
                      {account.login}
                    </code>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(account.login, "Login")} className="h-8 w-8 sm:h-6 sm:w-6 p-0 hover:bg-tech-accent/20 text-tech-accent flex-shrink-0">
                        <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar login</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 px-3 bg-tech-card rounded-lg border border-tech-accent/20">
                <span className="text-gray-300 text-sm sm:text-base">Senha:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-tech-darker rounded overflow-hidden flex-1 min-w-0">
                    <code className="block px-2 sm:px-3 py-1 text-xs sm:text-sm text-tech-highlight font-mono whitespace-nowrap overflow-x-auto">
                      {account.senha}
                    </code>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(account.senha, "Senha")} className="h-8 w-8 sm:h-6 sm:w-6 p-0 hover:bg-tech-accent/20 text-tech-accent flex-shrink-0">
                        <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar senha</p>
                    </TooltipContent>
                  </Tooltip>
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
      </CardContent>
      
      <CardFooter className="bg-tech-darker/30 flex flex-col justify-center pt-6 pb-6 border-t border-tech-accent/20 gap-3 mx-0 px-4 lg:px-[50px]">
        {showCredentials ? <Button className="w-full h-12 tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-bold text-base transition-all duration-300 rounded-lg" onClick={handleOpenPlatform}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir {account.plataforma}
          </Button> : <>
            <PaymentButton accountId={account.id} accountName={account.nome} price={account.preco} currency="BRL" isAccountSold={account.status === 'vendido'} />
            
            <button 
              onClick={() => navigate(`/comprar/${account.id}`)} 
              className="text-blue-500 hover:text-blue-400 font-medium text-base transition-colors duration-200 underline underline-offset-2"
            >
              {isShopify ? "Detalhes da Loja" : "Detalhes da Conta"}
            </button>
          </>}
      </CardFooter>

      {/* Image Viewer Modal */}
      {showImageViewer && <ImageViewer imageUrl={account.account_screenshot_url} isOpen={showImageViewer} onClose={() => setShowImageViewer(false)} title={`Screenshot da conta ${account.nome}`} />}
    </Card>;
});
AccountCard.displayName = "AccountCard";
export default AccountCard;