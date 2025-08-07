import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TikTokAccount } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { X, MessageCircle, Send, Share2, Copy, CheckCircle } from "lucide-react";
import { formatCurrency, formatNumberWithK } from "@/lib/helpers";
import { useState } from "react";
interface ShareAccountModalProps {
  account: TikTokAccount | null;
  isOpen: boolean;
  onClose: () => void;
}
const ShareAccountModal = ({
  account,
  isOpen,
  onClose
}: ShareAccountModalProps) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const {
    toast
  } = useToast();
  if (!account) return null;
  const currentUrl = window.location.href;
  const shareText = account.plataforma === 'Shopify' ? `\uD83D\uDED2 *${account.nome}*\n\n` + `\uD83D\uDCB2 *Preço:* ${formatCurrency(account.preco)}\n` + `\uD83D\uDC64 *Clientes:* ${formatNumberWithK(account.clientes || 0)}\n` + `\uD83D\uDCBC *Nicho:* ${account.nicho === 'Outros' && account.nicho_customizado ? account.nicho_customizado : account.nicho}\n` + `\uD83C\uDF0D *País:* ${account.pais}\n` + `\uD83D\uDCCB *Produtos:* ${account.produtos_cadastrados || 0}\n` + `\uD83D\uDCB3 *Vendas Mensais:* ${account.vendas_mensais || 'Não informado'}\n` + `\uD83C\uDFEC *Loja Pronta:* ${account.loja_pronta ? 'Sim' : 'Não'}\n` + `\uD83C\uDF10 *Domínio Incluso:* ${account.dominio_incluso ? 'Sim' : 'Não'}\n\n` + `\uD83D\uDD17 Ver loja: ${currentUrl}` : `\uD83D\uDCF1 *${account.nome}*\n\n` + `\uD83D\uDCB2 *Preço:* ${formatCurrency(account.preco)}\n` + `\uD83D\uDC65 *Seguidores:* ${formatNumberWithK(account.seguidores)}\n` + `\uD83D\uDCBC *Nicho:* ${account.nicho === 'Outros' && account.nicho_customizado ? account.nicho_customizado : account.nicho}\n` + `\uD83C\uDF0D *País:* ${account.pais}\n` + `\uD83D\uDCC8 *Engajamento:* ${account.engajamento}\n` + `\uD83D\uDCB0 *Monetizada:* ${account.monetizada || 'Não'}\n` + (account.plataforma === 'TikTok' ? `\uD83D\uDED2 *TikTok Shop:* ${account.tiktok_shop}\n` : '') + `\n\uD83D\uDD17 Ver conta: ${currentUrl}`;
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.substring(0, 280))}`
  };

  const handleShare = async (platform: string) => {
    if (platform === 'whatsapp') {
      // Try Web Share API first (works on mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: account.nome,
            text: shareText,
            url: currentUrl
          });
          onClose();
          return;
        } catch (shareError) {
          console.log('Web Share API failed, using fallback');
        }
      }
      
      // Fallback: Open WhatsApp with text only - using direct URL without encoding issues
      const whatsappUrl = `https://wa.me/?text=${shareText.replace(/ /g, '%20').replace(/\n/g, '%0A')}`;
      window.open(whatsappUrl, '_blank', 'width=600,height=400');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast({
          description: "Informações copiadas para a área de transferência!",
          duration: 2000
        });
      } catch (err) {
        toast({
          variant: "destructive",
          description: "Erro ao copiar informações"
        });
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
    onClose();
  };

  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-tech-secondary border-tech-border max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">Compartilhar Conta</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-tech-border">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* WhatsApp */}
          <Button onClick={() => handleShare('whatsapp')} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-3 py-3">
            <MessageCircle className="h-5 w-5" />
            <span>Compartilhar no WhatsApp</span>
          </Button>

          {/* Telegram */}
          <Button onClick={() => handleShare('telegram')} className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-3 py-3">
            <Send className="h-5 w-5" />
            <span>Compartilhar no Telegram</span>
          </Button>

          {/* Facebook */}
          <Button onClick={() => handleShare('facebook')} className="w-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center gap-3 py-3">
            <Share2 className="h-5 w-5" />
            <span>Compartilhar no Facebook</span>
          </Button>

          {/* Twitter */}
          <Button onClick={() => handleShare('twitter')} className="w-full bg-black hover:bg-gray-900 text-white flex items-center justify-center gap-3 py-3">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Compartilhar no Twitter</span>
          </Button>


          {/* Copiar Link */}
          <Button onClick={() => handleShare('copy')} className="w-full bg-tech-border hover:bg-tech-border/80 text-white flex items-center justify-center gap-3 py-3">
            {copiedLink ? <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Informações Copiadas!</span>
              </> : <>
                <Copy className="h-5 w-5" />
                <span>Copiar</span>
              </>}
          </Button>
        </div>

        {/* Preview */}
        
      </DialogContent>
    </Dialog>;
};
export default ShareAccountModal;