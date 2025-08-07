
import { useState } from "react";
import { TikTokAccount } from "@/types";
import { formatCurrency, formatNumberWithK, getPaisColor, getPlatformStyle } from "@/lib/helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Users, Brain, DollarSign, Store, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import RatingSeller from "@/components/RatingSeller";
import ComplaintModal from "@/components/ComplaintModal";

interface PurchasedAccountCardProps {
  account: TikTokAccount;
  isDesktop?: boolean;
  onUpdate?: () => void;
}

const PurchasedAccountCard = ({ account, isDesktop = false, onUpdate }: PurchasedAccountCardProps) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} copiado para a área de transferência!`,
      duration: 2000,
    });
  };

  const getPlatformUrl = (platform: string) => {
    const urls: { [key: string]: string } = {
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
  
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate mb-2">{account.nome}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                className="text-xs px-2 py-1 border-0"
                style={{ 
                  backgroundColor: paisColor,
                  color: '#FFFFFF'
                }}
              >
                {account.pais}
              </Badge>
              <Badge 
                className="text-xs px-2 py-1 border-0"
                style={{ 
                  backgroundColor: platformStyle.color,
                  color: '#FFFFFF'
                }}
              >
                {account.plataforma}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              {isShopify ? <Store className="h-4 w-4 text-gray-400" /> : <Users className="h-4 w-4 text-gray-400" />}
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {isShopify ? "Clientes" : "Seguidores"}
              </span>
            </div>
            <p className="text-white font-semibold">
              {isShopify 
                ? formatNumberWithK(account.clientes || 0)
                : formatNumberWithK(account.seguidores)
              }
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Nicho</span>
            </div>
            <p className="text-white font-semibold truncate">{account.nicho}</p>
          </div>
        </div>

        {/* Price */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Preço Pago</span>
          </div>
          <p className="text-blue-400 font-bold text-lg">
            {formatCurrency(account.preco)}
          </p>
        </div>
        
        {/* Credentials Section */}
        {showCredentials && (
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-white mb-3">Credenciais de Acesso</h4>
            
            {/* Login */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Login</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(account.login, "Login")}
                      className="h-6 w-6 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copiar login</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-black/20 rounded p-2 border border-white/10">
                <code className="text-sm text-blue-300 font-mono whitespace-nowrap overflow-x-auto block">
                  {account.login}
                </code>
              </div>
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Senha</span>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-6 w-6 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{showPassword ? "Ocultar senha" : "Mostrar senha"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(account.senha, "Senha")}
                        className="h-6 w-6 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar senha</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="bg-black/20 rounded p-2 border border-white/10">
                <code className="text-sm text-blue-300 font-mono whitespace-nowrap overflow-x-auto block">
                  {showPassword ? account.senha : "•".repeat(account.senha.length)}
                </code>
              </div>
            </div>

            {/* Platform Button */}
            <Button
              onClick={handleOpenPlatform}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir {account.plataforma}
            </Button>
          </div>
        )}

        {/* Rating Section */}
        {account.vendedor_id && (
          <RatingSeller 
            accountId={account.id}
            sellerId={account.vendedor_id}
            onRatingSubmitted={onUpdate}
          />
        )}

        {/* Complaint Section */}
        <div className="flex justify-end">
          <ComplaintModal 
            account={account}
            onComplaintSubmitted={() => onUpdate?.()}
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setShowCredentials(!showCredentials)}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30"
          variant="outline"
        >
          {showCredentials ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Ocultar Credenciais
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Ver Credenciais
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PurchasedAccountCard;
