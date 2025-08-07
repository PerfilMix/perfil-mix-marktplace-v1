import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Eye, EyeOff } from "lucide-react";

import AccountScreenshotUpload from "@/components/AccountScreenshotUpload";
import { PlataformaType } from "@/types";
import { getNichosList } from "@/lib/helpers";

const formSchema = z.object({
  nome: z.string().min(1, "Nome da conta é obrigatório"),
  plataforma: z.enum(['TikTok', 'Kwai', 'YouTube', 'Instagram', 'Facebook', 'Shopify']),
  seguidores: z.number().min(0, "Número de seguidores deve ser positivo"),
  clientes: z.number().min(0, "Número de clientes deve ser positivo").optional(),
  nicho: z.string().min(1, "Nicho é obrigatório"),
  nicho_customizado: z.string().optional(),
  pais: z.string().min(1, "País é obrigatório"),
  login: z.string().min(1, "Login é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
  preco: z.number().min(0.01, "Preço deve ser maior que zero"),
  status: z.enum(['disponivel_venda', 'em_producao', 'vendido']).default('disponivel_venda'),
  engajamento: z.enum(['Alto', 'Médio', 'Baixo']),
  tiktok_shop: z.enum(['Sim', 'Não']).default('Não'),
  monetizada: z.enum(['Sim', 'Não']).default('Não'),
  
  account_screenshot_url: z.string().min(1, "Screenshot da conta é obrigatório"),
  // Shopify fields
  descricao_loja: z.string().optional(),
  vendas_mensais: z.string().optional(),
  produtos_cadastrados: z.number().min(0).optional(),
  trafego_mensal: z.string().optional(),
  integracoes_ativas: z.string().optional(),
  dominio_incluso: z.boolean().default(false),
  loja_pronta: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface AddSellerAccountFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddSellerAccountForm = ({ onSuccess, onCancel }: AddSellerAccountFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [screenshotUploadKey, setScreenshotUploadKey] = useState(0); // Para forçar re-render do componente de screenshot
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const nichos = getNichosList();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      plataforma: 'TikTok',
      seguidores: 0,
      clientes: 0,
      produtos_cadastrados: 0,
      nicho: '',
      nicho_customizado: '',
      pais: '',
      login: '',
      senha: '',
      preco: 0,
      tiktok_shop: 'Não',
      monetizada: 'Não',
      engajamento: 'Médio',
      status: 'disponivel_venda',
      
      account_screenshot_url: '',
      descricao_loja: '',
      vendas_mensais: '',
      trafego_mensal: '',
      integracoes_ativas: '',
      dominio_incluso: false,
      loja_pronta: false,
    },
  });


  const handleScreenshotUpload = (imageUrl: string | null) => {
    form.setValue('account_screenshot_url', imageUrl || '');
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const isShopify = data.plataforma === "Shopify";
      
      const accountData = {
        nome: data.nome,
        seguidores: isShopify ? 0 : data.seguidores,
        clientes: isShopify ? data.clientes : null,
        nicho: data.nicho,
        nicho_customizado: data.nicho_customizado || null,
        pais: data.pais,
        login: data.login,
        senha: data.senha,
        preco: data.preco,
        status: data.status,
        plataforma: data.plataforma,
        tiktok_shop: data.tiktok_shop,
        monetizada: data.monetizada,
        engajamento: data.engajamento,
        profile_image_url: data.account_screenshot_url || null,
        // Shopify fields
        descricao_loja: isShopify ? data.descricao_loja : null,
        vendas_mensais: isShopify ? data.vendas_mensais : null,
        produtos_cadastrados: isShopify ? data.produtos_cadastrados : null,
        trafego_mensal: isShopify ? data.trafego_mensal : null,
        integracoes_ativas: isShopify ? data.integracoes_ativas : null,
        dominio_incluso: isShopify ? data.dominio_incluso : null,
        loja_pronta: isShopify ? data.loja_pronta : null,
        vendedor_id: user.id
      };

      const { error } = await supabase
        .from("accounts")
        .insert([accountData]);

      if (error) throw error;

      toast({
        title: "Conta adicionada",
        description: "A conta foi adicionada com sucesso!",
      });

      form.reset();
      
      setScreenshotUploadKey(prev => prev + 1); // Força re-render do componente de screenshot
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar a conta. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isShopify = form.watch('plataforma') === 'Shopify';

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Cadastrar Nova Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Screenshot da Conta */}
            <AccountScreenshotUpload
              key={screenshotUploadKey}
              currentImageUrl={form.watch('account_screenshot_url')}
              onImageUpload={handleScreenshotUpload}
              required={true}
            />
            
            {/* Validação do campo obrigatório */}
            {form.formState.errors.account_screenshot_url && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.account_screenshot_url.message}
              </p>
            )}

            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome da Conta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@exemplo_conta"
                        className="bg-tech-darker border-tech-border text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plataforma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Plataforma</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                          <SelectValue placeholder="Selecione a plataforma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                        <SelectItem value="Kwai">Kwai</SelectItem>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Shopify">Shopify</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seguidores/Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isShopify && (
                <FormField
                  control={form.control}
                  name="seguidores"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Seguidores</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10000"
                          className="bg-tech-darker border-tech-border text-white"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isShopify && (
                <FormField
                  control={form.control}
                  name="clientes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Clientes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-tech-darker border-tech-border text-white"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Preço (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="99.90"
                        className="bg-tech-darker border-tech-border text-white"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nicho e País */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nicho"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nicho</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                          <SelectValue placeholder="Selecione o nicho" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-tech-darker border-tech-border">
                        {nichos.map(nicho => (
                          <SelectItem key={nicho} value={nicho} className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">
                            {nicho}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">País</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                          <SelectValue placeholder="Selecione o país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Brasil">Brasil</SelectItem>
                        <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                        <SelectItem value="Alemanha">Alemanha</SelectItem>
                        <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Credenciais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Login</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usuario@email.com"
                        className="bg-tech-darker border-tech-border text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className="bg-tech-darker border-tech-border text-white pr-10"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Engajamento */}
            <div className="grid grid-cols-1 gap-4">
              {!isShopify && (
                <FormField
                  control={form.control}
                  name="engajamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Engajamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                            <SelectValue placeholder="Selecione o engajamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Alto">Alto</SelectItem>
                          <SelectItem value="Médio">Médio</SelectItem>
                          <SelectItem value="Baixo">Baixo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* TikTok Shop - somente para TikTok */}
            {form.watch('plataforma') === 'TikTok' && (
              <FormField
                control={form.control}
                name="tiktok_shop"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-white">TikTok Shop</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" className="border-white text-white" />
                          <Label className="text-white">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" className="border-white text-white" />
                          <Label className="text-white">Não</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Monetizada - para todas as contas exceto Shopify */}
            {!isShopify && (
              <FormField
                control={form.control}
                name="monetizada"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-white">Monetizada</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" className="border-white text-white" />
                          <Label className="text-white">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" className="border-white text-white" />
                          <Label className="text-white">Não</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Campos específicos do Shopify */}
            {isShopify && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-white">Informações da Loja Shopify</h3>
                
                <FormField
                  control={form.control}
                  name="descricao_loja"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Descrição da Loja</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a loja..."
                          className="bg-tech-darker border-tech-border text-white"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendas_mensais"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Vendas Mensais</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="R$ 10.000"
                            className="bg-tech-darker border-tech-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="produtos_cadastrados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Produtos Cadastrados</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            className="bg-tech-darker border-tech-border text-white"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="trafego_mensal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Tráfego Mensal</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="10.000 visitantes"
                            className="bg-tech-darker border-tech-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="integracoes_ativas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Integrações Ativas</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="PayPal, Stripe, etc."
                            className="bg-tech-darker border-tech-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="dominio_incluso"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-white data-[state=checked]:bg-tech-highlight"
                          />
                        </FormControl>
                        <FormLabel className="text-white">Domínio Incluso</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loja_pronta"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-white data-[state=checked]:bg-tech-highlight"
                          />
                        </FormControl>
                        <FormLabel className="text-white">Loja Pronta</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-tech-highlight hover:bg-tech-highlight/80 flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Adicionando..." : "Adicionar Conta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-tech-border text-white hover:bg-tech-secondary/20 flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddSellerAccountForm;
