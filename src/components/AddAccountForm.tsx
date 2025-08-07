
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

import { TikTokAccount, PlataformaType } from "@/types";
import { Eye, EyeOff } from "lucide-react";

interface AddAccountFormProps {
  onAccountAdded: () => void;
}

const AddAccountForm = ({ onAccountAdded }: AddAccountFormProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    seguidores: 0,
    clientes: 0,
    nicho: "",
    nicho_customizado: "",
    pais: "",
    login: "",
    senha: "",
    preco: 0,
    status: "disponivel_venda" as const,
    plataforma: "TikTok" as PlataformaType,
    tiktok_shop: "Não" as const,
    engajamento: "Médio" as const,
    // Shopify fields
    descricao_loja: "",
    vendas_mensais: "",
    produtos_cadastrados: 0,
    trafego_mensal: "",
    integracoes_ativas: "",
    dominio_incluso: false,
    loja_pronta: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isShopify = formData.plataforma === "Shopify";
      
      const accountData = {
        nome: formData.nome,
        seguidores: isShopify ? 0 : formData.seguidores,
        clientes: isShopify ? formData.clientes : null,
        nicho: formData.nicho,
        nicho_customizado: formData.nicho_customizado || null,
        pais: formData.pais,
        login: formData.login,
        senha: formData.senha,
        preco: formData.preco,
        status: formData.status,
        plataforma: formData.plataforma,
        tiktok_shop: formData.tiktok_shop,
        engajamento: formData.engajamento,
        
        // Shopify fields
        descricao_loja: isShopify ? formData.descricao_loja : null,
        vendas_mensais: isShopify ? formData.vendas_mensais : null,
        produtos_cadastrados: isShopify ? formData.produtos_cadastrados : null,
        trafego_mensal: isShopify ? formData.trafego_mensal : null,
        integracoes_ativas: isShopify ? formData.integracoes_ativas : null,
        dominio_incluso: isShopify ? formData.dominio_incluso : null,
        loja_pronta: isShopify ? formData.loja_pronta : null,
      };

      const { error } = await supabase
        .from("accounts")
        .insert([accountData]);

      if (error) throw error;

      toast({
        title: "Conta adicionada",
        description: "A conta foi adicionada com sucesso!",
      });

      // Reset form
      setFormData({
        nome: "",
        seguidores: 0,
        clientes: 0,
        nicho: "",
        nicho_customizado: "",
        pais: "",
        login: "",
        senha: "",
        preco: 0,
        status: "disponivel_venda",
        plataforma: "TikTok" as PlataformaType,
        tiktok_shop: "Não",
        engajamento: "Médio",
        
        descricao_loja: "",
        vendas_mensais: "",
        produtos_cadastrados: 0,
        trafego_mensal: "",
        integracoes_ativas: "",
        dominio_incluso: false,
        loja_pronta: false,
      });

      onAccountAdded();
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar a conta. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isShopify = formData.plataforma === "Shopify";

  return (
    <Card className="glass-card" style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
      <CardHeader>
        <CardTitle>Adicionar Nova Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Conta</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="plataforma">Plataforma</Label>
              <Select
                value={formData.plataforma}
                onValueChange={(value) => handleInputChange("plataforma", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

          {/* Seguidores/Clientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isShopify && (
              <div>
                <Label htmlFor="seguidores">Seguidores</Label>
                <Input
                  id="seguidores"
                  type="number"
                  value={formData.seguidores}
                  onChange={(e) => handleInputChange("seguidores", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            )}

            {isShopify && (
              <div>
                <Label htmlFor="clientes">Clientes</Label>
                <Input
                  id="clientes"
                  type="number"
                  value={formData.clientes}
                  onChange={(e) => handleInputChange("clientes", parseInt(e.target.value) || 0)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => handleInputChange("preco", parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Nicho e País */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nicho">Nicho</Label>
              <Input
                id="nicho"
                value={formData.nicho}
                onChange={(e) => handleInputChange("nicho", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="pais">País</Label>
              <Select
                value={formData.pais}
                onValueChange={(value) => handleInputChange("pais", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brasil">Brasil</SelectItem>
                  <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                  <SelectItem value="Alemanha">Alemanha</SelectItem>
                  <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Credenciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                value={formData.login}
                onChange={(e) => handleInputChange("login", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Status e Engajamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel_venda">Disponível para Venda</SelectItem>
                  <SelectItem value="em_producao">Em Produção</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isShopify && (
              <div>
                <Label htmlFor="engajamento">Engajamento</Label>
                <Select
                  value={formData.engajamento}
                  onValueChange={(value) => handleInputChange("engajamento", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alto">Alto</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Campos específicos do Shopify */}
          {isShopify && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Informações da Loja Shopify</h3>
              
              <div>
                <Label htmlFor="descricao_loja">Descrição da Loja</Label>
                <Textarea
                  id="descricao_loja"
                  value={formData.descricao_loja}
                  onChange={(e) => handleInputChange("descricao_loja", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendas_mensais">Vendas Mensais</Label>
                  <Input
                    id="vendas_mensais"
                    value={formData.vendas_mensais}
                    onChange={(e) => handleInputChange("vendas_mensais", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="produtos_cadastrados">Produtos Cadastrados</Label>
                  <Input
                    id="produtos_cadastrados"
                    type="number"
                    value={formData.produtos_cadastrados}
                    onChange={(e) => handleInputChange("produtos_cadastrados", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dominio_incluso"
                    checked={formData.dominio_incluso}
                    onCheckedChange={(checked) => handleInputChange("dominio_incluso", checked)}
                  />
                  <Label htmlFor="dominio_incluso">Domínio Incluso</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="loja_pronta"
                    checked={formData.loja_pronta}
                    onCheckedChange={(checked) => handleInputChange("loja_pronta", checked)}
                  />
                  <Label htmlFor="loja_pronta">Loja Pronta</Label>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adicionando..." : "Adicionar Conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddAccountForm;
