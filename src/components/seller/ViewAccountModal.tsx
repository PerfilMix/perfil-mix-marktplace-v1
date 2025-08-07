import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TikTokAccount } from "@/types";

interface ViewAccountModalProps {
  account: TikTokAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewAccountModal = ({ account, isOpen, onClose }: ViewAccountModalProps) => {
  if (!account) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel_venda':
        return 'Disponível';
      case 'vendido':
        return 'Vendida';
      case 'em_producao':
        return 'Em Produção';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatFollowers = (followers: number) => {
    if (followers >= 1000000) {
      return `${(followers / 1000000).toFixed(1)}M`;
    } else if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`;
    }
    return followers.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-tech-secondary border-tech-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Detalhes da Conta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-tech-light">Nome da Conta</label>
              <p className="text-white font-medium">{account.nome}</p>
            </div>
            <div>
              <label className="text-sm text-tech-light">Plataforma</label>
              <div className="mt-1">
                <Badge variant="outline" className="border-tech-highlight text-tech-highlight">
                  {account.plataforma}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-tech-light">Login</label>
              <p className="text-white font-medium">{account.login}</p>
            </div>
            <div>
              <label className="text-sm text-tech-light">Senha</label>
              <p className="text-white font-medium">{account.senha}</p>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-tech-light">
                {account.plataforma === "Shopify" ? "Clientes" : "Seguidores"}
              </label>
              <p className="text-white font-medium">
                {account.plataforma === "Shopify" 
                  ? formatFollowers(account.clientes || 0)
                  : formatFollowers(account.seguidores)
                }
              </p>
            </div>
            {account.plataforma === "Shopify" && (
              <>
                <div>
                  <label className="text-sm text-tech-light">Produtos</label>
                  <p className="text-white font-medium">{account.produtos_cadastrados || 0}</p>
                </div>
                <div>
                  <label className="text-sm text-tech-light">Vendas Mensais</label>
                  <p className="text-white font-medium">{account.vendas_mensais || "Não informado"}</p>
                </div>
              </>
            )}
            {account.plataforma !== "Shopify" && (
              <>
                <div>
                  <label className="text-sm text-tech-light">Monetizada</label>
                  <p className="text-white font-medium">{(account as any).monetizada || "Não"}</p>
                </div>
                <div>
                  <label className="text-sm text-tech-light">Engajamento</label>
                  <p className="text-white font-medium">{account.engajamento}</p>
                </div>
              </>
            )}
          </div>

          {/* Detalhes da loja */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-tech-light">Nicho</label>
              <p className="text-white font-medium">
                {(account.nicho === 'Outro' || account.nicho === 'Outros') && account.nicho_customizado 
                  ? account.nicho_customizado 
                  : account.nicho}
              </p>
            </div>
            <div>
              <label className="text-sm text-tech-light">País</label>
              <p className="text-white font-medium">{account.pais}</p>
            </div>
          </div>

          {account.plataforma !== "Shopify" && (
            <div className="grid grid-cols-2 gap-4">
              {account.plataforma === "TikTok" && (
                <div>
                  <label className="text-sm text-tech-light">TikTok Shop</label>
                  <p className="text-white font-medium">{account.tiktok_shop}</p>
                </div>
              )}
            </div>
          )}

          {/* Características específicas do Shopify */}
          {account.plataforma === "Shopify" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-tech-light">Loja Pronta</label>
                <p className="text-white font-medium">{account.loja_pronta ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <label className="text-sm text-tech-light">Domínio Incluso</label>
                <p className="text-white font-medium">{account.dominio_incluso ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          )}

          {/* Informações adicionais específicas do Shopify */}
          {account.plataforma === "Shopify" && (
            <>
              {account.descricao_loja && (
                <div>
                  <label className="text-sm text-tech-light">Descrição da Loja</label>
                  <p className="text-white">{account.descricao_loja}</p>
                </div>
              )}

              {account.trafego_mensal && (
                <div>
                  <label className="text-sm text-tech-light">Tráfego Mensal</label>
                  <p className="text-white">{account.trafego_mensal}</p>
                </div>
              )}

              {account.integracoes_ativas && (
                <div>
                  <label className="text-sm text-tech-light">Integrações Ativas</label>
                  <p className="text-white">{account.integracoes_ativas}</p>
                </div>
              )}
            </>
          )}

          {/* Preço e Status */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-tech-border">
            <div>
              <label className="text-sm text-tech-light">Preço</label>
              <p className="text-2xl font-bold text-tech-highlight">{formatPrice(account.preco)}</p>
            </div>
            <div>
              <label className="text-sm text-tech-light">Status</label>
              <div className="mt-1">
                <Badge variant="outline" className="border-tech-highlight text-tech-highlight">
                  {getStatusText(account.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAccountModal;