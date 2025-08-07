import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TikTokAccount } from "@/types";
import AccountScreenshotUpload from "@/components/AccountScreenshotUpload";
interface EditAccountModalProps {
  account: TikTokAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}
const EditAccountModal = ({
  account,
  isOpen,
  onClose,
  onUpdate
}: EditAccountModalProps) => {
  const [formData, setFormData] = useState<Partial<TikTokAccount>>({});
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (account) {
      setFormData({
        ...account
      });
    } else {
      setFormData({});
    }
  }, [account]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('accounts').update({
        nome: formData.nome,
        login: formData.login,
        senha: formData.senha,
        seguidores: formData.seguidores,
        clientes: formData.clientes,
        produtos_cadastrados: formData.produtos_cadastrados,
        nicho: formData.nicho,
        nicho_customizado: formData.nicho_customizado,
        pais: formData.pais,
        plataforma: formData.plataforma,
        tiktok_shop: formData.tiktok_shop,
        monetizada: (formData as any).monetizada,
        engajamento: formData.engajamento,
        loja_pronta: formData.loja_pronta,
        dominio_incluso: formData.dominio_incluso,
        descricao_loja: formData.descricao_loja,
        vendas_mensais: formData.vendas_mensais,
        trafego_mensal: formData.trafego_mensal,
        integracoes_ativas: formData.integracoes_ativas,
        preco: formData.preco,
        status: formData.status,
        account_screenshot_url: (formData as any).account_screenshot_url
      }).eq('id', account.id);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso"
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (!account) {
    return null;
  }
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-tech-secondary border-tech-border max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Conta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome" className="text-tech-light">Nome da Conta *</Label>
              <Input id="nome" value={formData.nome || ''} onChange={e => setFormData({
              ...formData,
              nome: e.target.value
            })} className="bg-tech-darker border-tech-border text-white" required />
            </div>
            <div>
              <Label htmlFor="plataforma" className="text-tech-light">Plataforma *</Label>
              <Select value={formData.plataforma || ""} onValueChange={value => setFormData({
              ...formData,
              plataforma: value as any
            })}>
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Kwai">Kwai</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Shopify">Shopify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="login" className="text-tech-light">Login *</Label>
              <Input id="login" value={formData.login || ''} onChange={e => setFormData({
              ...formData,
              login: e.target.value
            })} className="bg-tech-darker border-tech-border text-white" required />
            </div>
            <div>
              <Label htmlFor="senha" className="text-tech-light">Senha *</Label>
              <Input id="senha" value={formData.senha || ''} onChange={e => setFormData({
              ...formData,
              senha: e.target.value
            })} className="bg-tech-darker border-tech-border text-white" required />
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="seguidores" className="text-tech-light">
                {formData.plataforma === "Shopify" ? "Clientes" : "Seguidores *"}
              </Label>
              <Input id="seguidores" type="number" value={formData.plataforma === "Shopify" ? formData.clientes || '' : formData.seguidores || ''} onChange={e => {
              const value = parseInt(e.target.value) || 0;
              if (formData.plataforma === "Shopify") {
                setFormData({
                  ...formData,
                  clientes: value
                });
              } else {
                setFormData({
                  ...formData,
                  seguidores: value
                });
              }
            }} className="bg-tech-darker border-tech-border text-white" required />
            </div>
            {formData.plataforma === "Shopify" && <div>
                <Label htmlFor="produtos" className="text-tech-light">Produtos Cadastrados</Label>
                <Input id="produtos" type="number" value={formData.produtos_cadastrados || ''} onChange={e => setFormData({
              ...formData,
              produtos_cadastrados: parseInt(e.target.value) || 0
            })} className="bg-tech-darker border-tech-border text-white" />
              </div>}
          </div>

          {/* Nicho e localização */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nicho" className="text-tech-light">Nicho *</Label>
              <Select value={formData.nicho || ""} onValueChange={value => setFormData({
              ...formData,
              nicho: value
            })}>
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue placeholder="Selecione o nicho" />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  <SelectItem value="Pets">Pets</SelectItem>
                  <SelectItem value="Casa & Jardim">Casa & Jardim</SelectItem>
                  <SelectItem value="Beleza & Cosméticos">Beleza & Cosméticos</SelectItem>
                  <SelectItem value="Fitness & Saúde">Fitness & Saúde</SelectItem>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Moda">Moda</SelectItem>
                  <SelectItem value="Religião">Religião</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pais" className="text-tech-light">País *</Label>
              <Select value={formData.pais || ""} onValueChange={value => setFormData({
              ...formData,
              pais: value
            })}>
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  <SelectItem value="Brasil">Brasil</SelectItem>
                  <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                  <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                  <SelectItem value="Alemanha">Alemanha</SelectItem>
                  <SelectItem value="França">França</SelectItem>
                  <SelectItem value="Canadá">Canadá</SelectItem>
                  <SelectItem value="Austrália">Austrália</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nicho customizado */}
          {(formData.nicho === 'Outro' || formData.nicho === 'Outros') && <div>
              <Label htmlFor="nicho-customizado" className="text-tech-light">Especifique o Nicho *</Label>
              <Input id="nicho-customizado" value={formData.nicho_customizado || ''} onChange={e => setFormData({
            ...formData,
            nicho_customizado: e.target.value
          })} className="bg-tech-darker border-tech-border text-white" placeholder="Digite o nicho específico" required />
            </div>}

          {/* Configurações específicas por plataforma */}
          <div className="grid grid-cols-3 gap-4">
            {formData.plataforma === "TikTok" && <div>
                <Label htmlFor="tiktok-shop" className="text-tech-light">TikTok Shop</Label>
                <Select value={formData.tiktok_shop || ""} onValueChange={value => setFormData({
              ...formData,
              tiktok_shop: value as any
            })}>
                  <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-tech-darker border-tech-border">
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>}
            {formData.plataforma !== "Shopify" && <>
                <div>
                  <Label htmlFor="monetizada" className="text-tech-light">Monetizada</Label>
                  <Select value={(formData as any).monetizada || "Não"} onValueChange={value => setFormData({
                ...formData,
                monetizada: value as any
              })}>
                    <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-tech-darker border-tech-border">
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="engajamento" className="text-tech-light">Engajamento</Label>
                  <Select value={formData.engajamento || ""} onValueChange={value => setFormData({
                ...formData,
                engajamento: value as any
              })}>
                    <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-tech-darker border-tech-border">
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>}
          </div>

          {/* Switches - apenas para Shopify */}
          {formData.plataforma === "Shopify" && <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="loja-pronta" checked={formData.loja_pronta || false} onCheckedChange={checked => setFormData({
              ...formData,
              loja_pronta: checked
            })} />
                <Label htmlFor="loja-pronta" className="text-tech-light">Loja Pronta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="dominio-incluso" checked={formData.dominio_incluso || false} onCheckedChange={checked => setFormData({
              ...formData,
              dominio_incluso: checked
            })} />
                <Label htmlFor="dominio-incluso" className="text-tech-light">Domínio Incluso</Label>
              </div>
            </div>}

          {/* Campos específicos do Shopify */}
          {formData.plataforma === "Shopify" && <>
              <div>
                <Label htmlFor="descricao" className="text-tech-light">Descrição da Loja</Label>
                <Textarea id="descricao" value={formData.descricao_loja || ''} onChange={e => setFormData({
              ...formData,
              descricao_loja: e.target.value
            })} className="bg-tech-darker border-tech-border text-white" placeholder="Descreva os detalhes da loja..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vendas-mensais" className="text-tech-light">Vendas Mensais</Label>
                  <Input id="vendas-mensais" value={formData.vendas_mensais || ''} onChange={e => setFormData({
                ...formData,
                vendas_mensais: e.target.value
              })} className="bg-tech-darker border-tech-border text-white" placeholder="Ex: R$ 10.000" />
                </div>
                <div>
                  <Label htmlFor="trafego-mensal" className="text-tech-light">Tráfego Mensal</Label>
                  <Input id="trafego-mensal" value={formData.trafego_mensal || ''} onChange={e => setFormData({
                ...formData,
                trafego_mensal: e.target.value
              })} className="bg-tech-darker border-tech-border text-white" placeholder="Ex: 100K visualizações" />
                </div>
                <div>
                  <Label htmlFor="integracoes" className="text-tech-light">Integrações Ativas</Label>
                  <Input id="integracoes" value={formData.integracoes_ativas || ''} onChange={e => setFormData({
                ...formData,
                integracoes_ativas: e.target.value
              })} className="bg-tech-darker border-tech-border text-white" placeholder="Ex: Shopify, PayPal" />
                </div>
              </div>
            </>}

          {/* Screenshot da Conta */}
          <div>
            <AccountScreenshotUpload
              currentImageUrl={(formData as any).account_screenshot_url}
              onImageUpload={(imageUrl) => {
                setFormData({
                  ...formData,
                  account_screenshot_url: imageUrl
                } as any);
              }}
            />
          </div>

          {/* Preço e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco" className="text-tech-light">Preço (R$) *</Label>
              <Input id="preco" type="number" step="0.01" value={formData.preco || ''} onChange={e => setFormData({
              ...formData,
              preco: parseFloat(e.target.value) || 0
            })} className="bg-tech-darker border-tech-border text-white" required />
            </div>
            <div>
              <Label htmlFor="status" className="text-tech-light">Status</Label>
              <Select value={formData.status || ""} onValueChange={value => setFormData({
              ...formData,
              status: value as any
            })}>
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  <SelectItem value="disponivel_venda">Disponível</SelectItem>
                  <SelectItem value="em_producao">Em Produção</SelectItem>
                  <SelectItem value="vendido">Vendida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-tech-border text-tech-light hover:bg-tech-darker">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-tech-highlight hover:bg-tech-highlight/80 text-tech-darker">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default EditAccountModal;