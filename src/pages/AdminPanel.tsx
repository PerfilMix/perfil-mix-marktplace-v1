import { useState, useEffect } from "react";
import { TikTokAccount, AccountStatusType } from "@/types";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Plus, Settings, Users, User, Image, UserCheck, MessageSquare, Eye, EyeOff, Shield } from "lucide-react";
import { getNichosList, formatCurrency } from "@/lib/helpers";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { v4 as uuidv4 } from "uuid";
import TextSettingsManager from "@/components/TextSettingsManager";
import LogoSettingsManager from "@/components/LogoSettingsManager";
import UserManagement from "@/components/UserManagement";
import { useIsMobile } from "@/hooks/use-mobile";
import ImprovedAccountsTable from "@/components/ImprovedAccountsTable";
import PaymentSettingsManager from "@/components/PaymentSettingsManager";
import AccountStatusSelector from "@/components/AccountStatusSelector";
import AdminDashboard from "@/components/AdminDashboard";
import { BarChart3 } from "lucide-react";
import BannerManager from "@/components/BannerManager";
import ProfessionalColorManager from "@/components/ProfessionalColorManager";
import AccountScreenshotUpload from "@/components/AccountScreenshotUpload";
import { SellerRequestsManager } from "@/components/SellerRequestsManager";
import SellerControl from "@/components/SellerControl";
import ComplaintsManager from "@/components/ComplaintsManager";
import CommissionManager from "@/components/admin/CommissionManager";
import SupportSettingsManager from "@/components/SupportSettingsManager";
import ManualUserRegistration from "@/components/ManualUserRegistration";
import AdminManagement from "@/components/AdminManagement";


const AdminPanel = () => {
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<TikTokAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // Changed default to dashboard

  // Estados para configurações de branding
  const [textSettings, setTextSettings] = useState<Record<string, string>>({});
  const [brandingSettings, setBrandingSettings] = useState<Record<string, string>>({});

  // Form states
  const [nome, setNome] = useState("");
  const [seguidores, setSeguidores] = useState("");
  const [clientes, setClientes] = useState("");
  const [nicho, setNicho] = useState<string>("");
  const [nichoCustomizado, setNichoCustomizado] = useState("");
  const [pais, setPais] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [preco, setPreco] = useState("");
  const [plataforma, setPlataforma] = useState<'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify'>("TikTok");
  const [tiktokShop, setTiktokShop] = useState<'Sim' | 'Não'>("Não");
  const [monetizada, setMonetizada] = useState<'Sim' | 'Não'>("Não");
  const [engajamento, setEngajamento] = useState<'Alto' | 'Médio' | 'Baixo'>("Médio");
  const [accountStatus, setAccountStatus] = useState<AccountStatusType>("disponivel_venda");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Shopify specific fields
  const [descricaoLoja, setDescricaoLoja] = useState("");
  const [vendasMensais, setVendasMensais] = useState("");
  const [produtosCadastrados, setProdutosCadastrados] = useState("");
  const [trafegoMensal, setTrafegoMensal] = useState("");
  const [integracoesAtivas, setIntegracoesAtivas] = useState("");
  const [dominioIncluso, setDominioIncluso] = useState(false);
  const [lojaPronta, setLojaPronta] = useState(false);

  // Estado para o filtro de contas na aba de gerenciamento
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "available" | "production" | "sold">("all");
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const nichos = getNichosList();
  const isMobile = useIsMobile();
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const getActiveTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard de Controle";
      case "add":
        return plataforma === "Shopify" ? "Adicionar Nova Loja" : "Adicionar Nova Conta";
      case "manage":
        return `Gerenciar Contas (${filteredAccounts.length})`;
      case "manual-registration":
        return "Cadastro Manual de Usuários";
      case "complaints":
        return "Reclamações";
      case "seller-requests":
        return "Solicitações de Vendas";
      case "seller-control":
        return "Controle de Vendedores";
      case "commissions":
        return "Configurações de Comissão";
      case "users":
        return "Controle de Usuários";
      case "admins":
        return "Controle de ADM";
      case "personalize":
        return "Personalização";
      default:
        return "Painel de Administração";
    }
  };
  const getActiveTabIcon = () => {
    switch (activeTab) {
      case "dashboard":
        return <BarChart3 className="h-5 w-5" />;
      case "add":
        return <Plus className="h-5 w-5" />;
      case "manage":
        return <Settings className="h-5 w-5" />;
      case "manual-registration":
        return <UserCheck className="h-5 w-5" />;
      case "complaints":
        return <MessageSquare className="h-5 w-5" />;
      case "seller-requests":
        return <UserCheck className="h-5 w-5" />;
      case "seller-control":
        return <Users className="h-5 w-5" />;
      case "commissions":
        return <Settings className="h-5 w-5" />;
      case "users":
        return <Users className="h-5 w-5" />;
      case "admins":
        return <Shield className="h-5 w-5" />;
      case "personalize":
        return <User className="h-5 w-5" />;
      default:
        return null;
    }
  };
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você precisa fazer login como administrador."
      });
      navigate("/admin-login");
      return;
    }
    
    if (isAuthenticated) {
      fetchAccounts();
      fetchSettings();
    }
  }, [isAuthenticated, authLoading, navigate, toast]);
  const fetchSettings = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("site_settings").select("*").eq("active", true).in("type", ["text", "branding"]);
      if (error) throw error;
      const textSettingsObj: Record<string, string> = {};
      const brandingSettingsObj: Record<string, string> = {};
      data?.forEach(setting => {
        if (setting.type === "text") {
          textSettingsObj[setting.key] = setting.value;
        } else if (setting.type === "branding") {
          brandingSettingsObj[setting.key] = setting.value;
        }
      });
      setTextSettings(textSettingsObj);
      setBrandingSettings(brandingSettingsObj);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };
  useEffect(() => {
    const channel = supabase.channel('site-settings-admin').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'site_settings'
    }, () => {
      fetchSettings();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('accounts').select('*').order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }
      if (data) {
        setAccounts(data as TikTokAccount[]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as contas."
      });
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setNome("");
    setSeguidores("");
    setClientes("");
    setNicho("");
    setNichoCustomizado("");
    setPais("");
    setLogin("");
    setSenha("");
    setPreco("");
    setPlataforma("TikTok");
    setTiktokShop("Não");
    setMonetizada("Não");
    setEngajamento("Médio");
    setAccountStatus("disponivel_venda");
    setProfileImageUrl(null);
    setDescricaoLoja("");
    setVendasMensais("");
    setProdutosCadastrados("");
    setTrafegoMensal("");
    setIntegracoesAtivas("");
    setDominioIncluso(false);
    setLojaPronta(false);
    setCurrentAccount(null);
  };
  const handleAddAccount = async () => {
    if (!nome || !nicho || !pais || !login || !senha || !preco) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios."
      });
      return;
    }
    if (plataforma === "Shopify" && !clientes) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe o número de clientes para lojas Shopify."
      });
      return;
    }
    if (plataforma !== "Shopify" && !seguidores) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe o número de seguidores."
      });
      return;
    }
    if (nicho === "Outros" && !nichoCustomizado.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, especifique o nicho quando 'Outros' for selecionado."
      });
      return;
    }
    setIsLoading(true);
    try {
      const newAccountData = {
        id: uuidv4(),
        nome,
        seguidores: plataforma === "Shopify" ? 0 : parseInt(seguidores),
        clientes: plataforma === "Shopify" ? parseInt(clientes) : 0,
        nicho,
        nicho_customizado: nicho === "Outros" ? nichoCustomizado : null,
        pais,
        login,
        senha,
        preco: parseFloat(preco),
        status: accountStatus,
        plataforma: plataforma,
        tiktok_shop: tiktokShop,
        monetizada: monetizada,
        engajamento: engajamento,
        profile_image_url: profileImageUrl,
        descricao_loja: plataforma === "Shopify" ? descricaoLoja : null,
        vendas_mensais: plataforma === "Shopify" ? vendasMensais : null,
        produtos_cadastrados: plataforma === "Shopify" ? produtosCadastrados ? parseInt(produtosCadastrados) : 0 : null,
        trafego_mensal: plataforma === "Shopify" ? trafegoMensal : null,
        integracoes_ativas: plataforma === "Shopify" ? integracoesAtivas : null,
        dominio_incluso: plataforma === "Shopify" ? dominioIncluso : null,
        loja_pronta: plataforma === "Shopify" ? lojaPronta : null
      };
      const {
        error
      } = await supabase.from('accounts').insert(newAccountData);
      if (error) {
        throw error;
      }
      const newAccount: TikTokAccount = {
        ...newAccountData,
        status: accountStatus,
        plataforma: plataforma as 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify',
        tiktok_shop: tiktokShop as 'Sim' | 'Não',
        engajamento: engajamento as 'Alto' | 'Médio' | 'Baixo'
      };
      setAccounts([newAccount, ...accounts]);
      toast({
        title: plataforma === "Shopify" ? "Loja adicionada" : "Conta adicionada",
        description: `${plataforma === "Shopify" ? "A loja" : "A conta"} ${nome} foi adicionada com sucesso.`
      });
      resetForm();
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        variant: "destructive",
        title: plataforma === "Shopify" ? "Erro ao adicionar loja" : "Erro ao adicionar conta",
        description: "Ocorreu um erro ao adicionar no banco de dados."
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateAccount = async () => {
    if (!currentAccount) return;
    if (nicho === "Outros" && !nichoCustomizado.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, especifique o nicho quando 'Outros' for selecionado."
      });
      return;
    }
    setIsLoading(true);
    try {
      const updatedAccountData = {
        nome,
        seguidores: plataforma === "Shopify" ? 0 : parseInt(seguidores),
        clientes: plataforma === "Shopify" ? parseInt(clientes) : 0,
        nicho,
        nicho_customizado: nicho === "Outros" ? nichoCustomizado : null,
        pais,
        login,
        senha,
        preco: parseFloat(preco),
        status: accountStatus,
        plataforma,
        tiktok_shop: tiktokShop,
        monetizada: monetizada,
        engajamento: engajamento,
        profile_image_url: profileImageUrl,
        descricao_loja: plataforma === "Shopify" ? descricaoLoja : null,
        vendas_mensais: plataforma === "Shopify" ? vendasMensais : null,
        produtos_cadastrados: plataforma === "Shopify" ? produtosCadastrados ? parseInt(produtosCadastrados) : 0 : null,
        trafego_mensal: plataforma === "Shopify" ? trafegoMensal : null,
        integracoes_ativas: plataforma === "Shopify" ? integracoesAtivas : null,
        dominio_incluso: plataforma === "Shopify" ? dominioIncluso : null,
        loja_pronta: plataforma === "Shopify" ? lojaPronta : null
      };
      const {
        error
      } = await supabase.from('accounts').update(updatedAccountData).eq('id', currentAccount.id);
      if (error) {
        throw error;
      }
      const updatedAccount: TikTokAccount = {
        ...currentAccount,
        ...updatedAccountData,
        plataforma: plataforma as 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify',
        tiktok_shop: tiktokShop as 'Sim' | 'Não',
        engajamento: engajamento as 'Alto' | 'Médio' | 'Baixo'
      };
      setAccounts(accounts.map(account => account.id === currentAccount.id ? updatedAccount : account));
      toast({
        title: plataforma === "Shopify" ? "Loja atualizada" : "Conta atualizada",
        description: `${plataforma === "Shopify" ? "A loja" : "A conta"} ${nome} foi atualizada com sucesso.`
      });
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        variant: "destructive",
        title: plataforma === "Shopify" ? "Erro ao atualizar loja" : "Erro ao atualizar conta",
        description: "Ocorreu um erro ao atualizar no banco de dados."
      });
    } finally {
      setIsLoading(false);
    }
  };
  const openEditModal = (account: TikTokAccount) => {
    setCurrentAccount(account);
    setNome(account.nome);
    setSeguidores(account.seguidores?.toString() || "0");
    setClientes(account.clientes?.toString() || "0");
    setNicho(account.nicho);
    setNichoCustomizado(account.nicho_customizado || "");
    setPais(account.pais);
    setLogin(account.login);
    setSenha(account.senha);
    setPreco(account.preco.toString());
    setPlataforma(account.plataforma);
    setTiktokShop(account.tiktok_shop || "Não");
    setMonetizada((account as any).monetizada || "Não");
    setEngajamento(account.engajamento || "Médio");
    setAccountStatus(account.status);
    setProfileImageUrl(account.profile_image_url || null);
    setDescricaoLoja(account.descricao_loja || "");
    setVendasMensais(account.vendas_mensais || "");
    setProdutosCadastrados(account.produtos_cadastrados?.toString() || "");
    setTrafegoMensal(account.trafego_mensal || "");
    setIntegracoesAtivas(account.integracoes_ativas || "");
    setDominioIncluso(account.dominio_incluso || false);
    setLojaPronta(account.loja_pronta || false);
    setIsEditModalOpen(true);
  };
  const handleDeleteAccount = async (id: string) => {
    const accountToDelete = accounts.find(account => account.id === id);
    if (accountToDelete?.status === "vendido") {
      toast({
        variant: "destructive",
        title: "Operação não permitida",
        description: "Contas vendidas não podem ser excluídas."
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from('accounts').delete().eq('id', id);
      if (error) {
        throw error;
      }
      setAccounts(accounts.filter(account => account.id !== id));
      toast({
        title: "Conta removida",
        description: "A conta foi removida com sucesso."
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover conta",
        description: "Ocorreu um erro ao remover a conta do banco de dados."
      });
    } finally {
      setIsLoading(false);
    }
  };
  const filteredAccounts = accounts.filter(account => {
    if (activeStatusFilter === "all") return true;
    if (activeStatusFilter === "available") return account.status === "disponivel_venda";
    if (activeStatusFilter === "production") return account.status === "em_producao";
    if (activeStatusFilter === "sold") return account.status === "vendido";
    return true;
  });
  const getFooterCompanyName = () => {
    return textSettings.footer_company_name || brandingSettings.site_name || "AcountX";
  };
  const getFilterLabel = (filter: "all" | "available" | "production" | "sold") => {
    switch (filter) {
      case "all":
        return "Todas";
      case "available":
        return "Disponíveis";
      case "production":
        return "Em Produção";
      case "sold":
        return "Vendidas";
      default:
        return "Todas";
    }
  };
  const renderAddAccountContent = () => <Card className="glass-card shadow-tech border-tech-accent/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-gray-300">{plataforma === "Shopify" ? "Nome da Loja" : "Nome da Conta"}</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder={plataforma === "Shopify" ? "Ex: ModaFashion Store" : "Ex: FashionTrends"} className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
          </div>
          
          {plataforma !== "Shopify" && <div className="space-y-2">
              <Label htmlFor="seguidores" className="text-gray-300">Número de Seguidores</Label>
              <Input id="seguidores" type="number" value={seguidores} onChange={e => setSeguidores(e.target.value)} placeholder="Ex: 10000" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
            </div>}

          {plataforma === "Shopify" && <div className="space-y-2">
              <Label htmlFor="clientes" className="text-gray-300">Número de Clientes</Label>
              <Input id="clientes" type="number" value={clientes} onChange={e => setClientes(e.target.value)} placeholder="Ex: 500" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
            </div>}
          
          <div className="space-y-2">
            <Label htmlFor="nicho" className="text-gray-300">Nicho</Label>
            <Select value={nicho} onValueChange={value => setNicho(value)}>
              <SelectTrigger id="nicho" className="glass-card border-tech-accent/20 text-white">
                <SelectValue placeholder="Selecione o nicho" />
              </SelectTrigger>
              <SelectContent className="glass-card border-tech-accent/20">
                {nichos.map(n => <SelectItem key={n} value={n} className="text-white">
                    {n}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {nicho === "Outros" && <div className="space-y-2">
              <Label htmlFor="nichoCustomizado" className="text-gray-300">Especificar Nicho</Label>
              <Input id="nichoCustomizado" value={nichoCustomizado} onChange={e => setNichoCustomizado(e.target.value)} placeholder="Digite o nicho específico" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
            </div>}
          
          <div className="space-y-2">
            <Label htmlFor="pais" className="text-gray-300">País</Label>
            <Select value={pais} onValueChange={value => setPais(value)}>
              <SelectTrigger id="pais" className="glass-card border-tech-accent/20 text-white">
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent className="glass-card border-tech-accent/20">
                <SelectItem value="Brasil" className="text-white">Brasil</SelectItem>
                <SelectItem value="Estados Unidos" className="text-white">Estados Unidos</SelectItem>
                <SelectItem value="Alemanha" className="text-white">Alemanha</SelectItem>
                <SelectItem value="Reino Unido" className="text-white">Reino Unido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plataforma" className="text-gray-300">Plataforma</Label>
            <Select value={plataforma} onValueChange={(value: 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify') => setPlataforma(value)}>
              <SelectTrigger id="plataforma" className="glass-card border-tech-accent/20 text-white">
                <SelectValue placeholder="Selecione a plataforma" />
              </SelectTrigger>
              <SelectContent className="glass-card border-tech-accent/20">
                <SelectItem value="TikTok" className="text-white">TikTok</SelectItem>
                <SelectItem value="Kwai" className="text-white">Kwai</SelectItem>
                <SelectItem value="YouTube" className="text-white">YouTube</SelectItem>
                <SelectItem value="Instagram" className="text-white">Instagram</SelectItem>
                <SelectItem value="Facebook" className="text-white">Facebook</SelectItem>
                <SelectItem value="Shopify" className="text-white">Shopify</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AccountStatusSelector value={accountStatus} onChange={setAccountStatus} />

          {plataforma !== "Shopify" && <div className="space-y-2">
              <Label htmlFor="engajamento" className="text-gray-300">Engajamento</Label>
              <Select value={engajamento} onValueChange={(value: 'Alto' | 'Médio' | 'Baixo') => setEngajamento(value)}>
                <SelectTrigger id="engajamento" className="glass-card border-tech-accent/20 text-white">
                  <SelectValue placeholder="Selecione o engajamento" />
                </SelectTrigger>
                <SelectContent className="glass-card border-tech-accent/20">
                  <SelectItem value="Alto" className="text-white">Alto</SelectItem>
                  <SelectItem value="Médio" className="text-white">Médio</SelectItem>
                  <SelectItem value="Baixo" className="text-white">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>}

          {plataforma === "TikTok" && <div className="space-y-2">
              <Label className="text-gray-300">TikTok Shop</Label>
              <RadioGroup value={tiktokShop} onValueChange={(value: 'Sim' | 'Não') => setTiktokShop(value)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sim" id="tiktok-shop-sim" />
                  <Label htmlFor="tiktok-shop-sim" className="text-gray-300">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não" id="tiktok-shop-nao" />
                  <Label htmlFor="tiktok-shop-nao" className="text-gray-300">Não</Label>
                </div>
              </RadioGroup>
             </div>}

           {/* Monetizada - para todas as contas exceto Shopify */}
           {plataforma !== "Shopify" && <div className="space-y-2">
               <Label className="text-gray-300">Monetizada</Label>
               <RadioGroup value={monetizada} onValueChange={(value: 'Sim' | 'Não') => setMonetizada(value)} className="flex gap-4">
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="Sim" id="monetizada-sim" />
                   <Label htmlFor="monetizada-sim" className="text-gray-300">Sim</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="Não" id="monetizada-nao" />
                   <Label htmlFor="monetizada-nao" className="text-gray-300">Não</Label>
                 </div>
               </RadioGroup>
             </div>}

          {/* Shopify specific fields */}
          {plataforma === "Shopify" && <>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricaoLoja" className="text-gray-300">Descrição da Loja</Label>
                <Textarea id="descricaoLoja" value={descricaoLoja} onChange={e => setDescricaoLoja(e.target.value)} placeholder="Descreva os produtos, público-alvo e características da loja..." rows={3} className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendasMensais" className="text-gray-300">Vendas Mensais</Label>
                <Input id="vendasMensais" value={vendasMensais} onChange={e => setVendasMensais(e.target.value)} placeholder="Ex: R$ 5.000 - R$ 10.000" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="produtosCadastrados" className="text-gray-300">Produtos Cadastrados</Label>
                <Input id="produtosCadastrados" type="number" value={produtosCadastrados} onChange={e => setProdutosCadastrados(e.target.value)} placeholder="Ex: 150" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trafegoMensal" className="text-gray-300">Tráfego Mensal</Label>
                <Input id="trafegoMensal" value={trafegoMensal} onChange={e => setTrafegoMensal(e.target.value)} placeholder="Ex: 10.000 visitantes" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="integracoesAtivas" className="text-gray-300">Integrações Ativas</Label>
                <Input id="integracoesAtivas" value={integracoesAtivas} onChange={e => setIntegracoesAtivas(e.target.value)} placeholder="Ex: Stripe, PagSeguro, Google Analytics" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="dominioIncluso" checked={dominioIncluso} onCheckedChange={checked => setDominioIncluso(checked as boolean)} />
                  <Label htmlFor="dominioIncluso" className="text-gray-300">Domínio incluso</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="lojaPronta" checked={lojaPronta} onCheckedChange={checked => setLojaPronta(checked as boolean)} />
                  <Label htmlFor="lojaPronta" className="text-gray-300">Loja pronta para rodar</Label>
                </div>
              </div>
            </>}
          
          <div className="space-y-2">
            <Label htmlFor="preco" className="text-gray-300">Preço (R$)</Label>
            <Input id="preco" type="number" value={preco} onChange={e => setPreco(e.target.value)} placeholder="Ex: 1000" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
          </div>
          
          {/* Campo de upload de screenshot da conta - posicionado acima do campo de login */}
          <div className="space-y-2 md:col-span-2">
            <AccountScreenshotUpload
              currentImageUrl={profileImageUrl}
              onImageUpload={setProfileImageUrl}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="login" className="text-gray-300">{plataforma === "Shopify" ? "Login da Loja" : "Login da Conta"}</Label>
            <Input id="login" value={login} onChange={e => setLogin(e.target.value)} placeholder={plataforma === "Shopify" ? "Login da loja" : "Login da conta"} className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="senha" className="text-gray-300">{plataforma === "Shopify" ? "Senha da Loja" : "Senha da Conta"}</Label>
            <div className="relative">
              <Input 
                id="senha" 
                type={showPassword ? "text" : "password"} 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                placeholder={plataforma === "Shopify" ? "Senha da loja" : "Senha da conta"} 
                className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400 pr-10" 
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
        
        <Button onClick={handleAddAccount} className="w-full mt-6 tech-gradient hover:shadow-glow text-white font-semibold py-3" disabled={isLoading}>
          {isLoading ? "Adicionando..." : plataforma === "Shopify" ? "Adicionar Loja" : "Adicionar Conta"}
        </Button>
      </CardContent>
    </Card>;
  const renderManageAccountsContent = () => <Card className="glass-card shadow-tech border-tech-accent/20">
      <CardContent className="p-6">
        <div className="mb-6">
          {isMobile ? <Select value={activeStatusFilter} onValueChange={(value: "all" | "available" | "production" | "sold") => setActiveStatusFilter(value)}>
              <SelectTrigger className="w-full glass-card border-tech-accent/20 text-white">
                <SelectValue>
                  Filtrar: {getFilterLabel(activeStatusFilter)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="glass-card border-tech-accent/20">
                <SelectItem value="all" className="text-white">Todas</SelectItem>
                <SelectItem value="available" className="text-white">Disponíveis</SelectItem>
                <SelectItem value="production" className="text-white">Em Produção</SelectItem>
                <SelectItem value="sold" className="text-white">Vendidas</SelectItem>
              </SelectContent>
            </Select> : <div className="flex flex-wrap gap-2">
              <Button variant={activeStatusFilter === "all" ? "default" : "outline"} onClick={() => setActiveStatusFilter("all")} className={activeStatusFilter === "all" ? "bg-tech-accent hover:bg-tech-highlight text-white" : "glass-card text-gray-300 hover:bg-tech-accent/10 hover:text-white"}>
                Todas
              </Button>
              <Button variant={activeStatusFilter === "available" ? "default" : "outline"} onClick={() => setActiveStatusFilter("available")} className={activeStatusFilter === "available" ? "bg-green-600 hover:bg-green-700 text-white" : "glass-card text-gray-300 hover:bg-green-600/10 hover:text-white"}>
                Disponíveis
              </Button>
              <Button variant={activeStatusFilter === "production" ? "default" : "outline"} onClick={() => setActiveStatusFilter("production")} className={activeStatusFilter === "production" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "glass-card text-gray-300 hover:bg-indigo-600/10 hover:text-white"}>
                Em Produção
              </Button>
              <Button variant={activeStatusFilter === "sold" ? "default" : "outline"} onClick={() => setActiveStatusFilter("sold")} className={activeStatusFilter === "sold" ? "bg-red-600 hover:bg-red-700 text-white" : "glass-card text-gray-300 hover:bg-red-600/10 hover:text-white"}>
                Vendidas
              </Button>
            </div>}
        </div>

        <ImprovedAccountsTable accounts={filteredAccounts} onEdit={openEditModal} onDelete={handleDeleteAccount} isLoading={isLoading} />
      </CardContent>
    </Card>;
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard accounts={accounts} />;
      case "add":
        return renderAddAccountContent();
      case "manage":
        return renderManageAccountsContent();
      case "manual-registration":
        return <ManualUserRegistration />;
      case "complaints":
        return <ComplaintsManager />;
      case "seller-requests":
        return <SellerRequestsManager />;
      case "seller-control":
        return <SellerControl />;
      case "commissions":
        return <CommissionManager />;
      case "users":
        return <UserManagement />;
      case "admins":
        return <AdminManagement />;
      case "personalize":
        return <div className="space-y-8">
            <ProfessionalColorManager />
            <BannerManager />
            <LogoSettingsManager />
            <TextSettingsManager />
            <SupportSettingsManager />
            <PaymentSettingsManager />
          </div>;
      default:
        return <AdminDashboard accounts={accounts} />;
    }
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-tech-darker">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          {/* Header with trigger */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-tech-accent/20 glass-card">
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-3">
                {getActiveTabIcon()}
                <h1 className="text-2xl font-bold text-white">{getActiveTabTitle()}</h1>
              </div>
            </div>
          </header>
          
          <main className="flex-1 px-6 py-8">
            {renderContent()}
          </main>

          <footer className="glass-card border-tech-accent/20 py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-gray-300">
              <p>© {new Date().getFullYear()} {getFooterCompanyName()}. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </div>

      {/* Edit Modal - mantém a mesma estrutura */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-card max-w-4xl border-tech-accent/20">
          <DialogHeader>
            <DialogTitle className="text-white">{plataforma === "Shopify" ? "Editar Loja" : "Editar Conta"}</DialogTitle>
            <DialogDescription className="text-gray-300">
              Atualize as informações da {plataforma === "Shopify" ? "loja" : "conta"} selecionada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-nome" className="text-gray-300">{plataforma === "Shopify" ? "Nome da Loja" : "Nome da Conta"}</Label>
              <Input id="edit-nome" value={nome} onChange={e => setNome(e.target.value)} className="glass-card border-tech-accent/20 text-white" />
            </div>
            
            {plataforma !== "Shopify" && <div className="space-y-2">
                <Label htmlFor="edit-seguidores" className="text-gray-300">Número de Seguidores</Label>
                <Input id="edit-seguidores" type="number" value={seguidores} onChange={e => setSeguidores(e.target.value)} className="glass-card border-tech-accent/20 text-white" />
              </div>}

            {plataforma === "Shopify" && <div className="space-y-2">
                <Label htmlFor="edit-clientes" className="text-gray-300">Número de Clientes</Label>
                <Input id="edit-clientes" type="number" value={clientes} onChange={e => setClientes(e.target.value)} className="glass-card border-tech-accent/20 text-white" />
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="edit-nicho" className="text-gray-300">Nicho</Label>
              <Select value={nicho} onValueChange={value => setNicho(value)}>
                <SelectTrigger id="edit-nicho" className="glass-card border-tech-accent/20 text-white">
                  <SelectValue placeholder="Selecione o nicho" />
                </SelectTrigger>
                <SelectContent className="glass-card border-tech-accent/20">
                  {nichos.map(n => <SelectItem key={n} value={n} className="text-white">
                      {n}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {nicho === "Outros" && <div className="space-y-2">
                <Label htmlFor="edit-nichoCustomizado" className="text-gray-300">Especificar Nicho</Label>
                <Input id="edit-nichoCustomizado" value={nichoCustomizado} onChange={e => setNichoCustomizado(e.target.value)} placeholder="Digite o nicho específico" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="edit-pais" className="text-gray-300">País</Label>
              <Select value={pais} onValueChange={value => setPais(value)}>
                <SelectTrigger id="edit-pais" className="glass-card border-tech-accent/20 text-white">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent className="glass-card border-tech-accent/20">
                  <SelectItem value="Brasil" className="text-white">Brasil</SelectItem>
                  <SelectItem value="Estados Unidos" className="text-white">Estados Unidos</SelectItem>
                  <SelectItem value="Alemanha" className="text-white">Alemanha</SelectItem>
                  <SelectItem value="Reino Unido" className="text-white">Reino Unido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-plataforma" className="text-gray-300">Plataforma</Label>
              <Select value={plataforma} onValueChange={(value: 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify') => setPlataforma(value)}>
                <SelectTrigger id="edit-plataforma" className="glass-card border-tech-accent/20 text-white">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent className="glass-card border-tech-accent/20">
                  <SelectItem value="TikTok" className="text-white">TikTok</SelectItem>
                  <SelectItem value="Kwai" className="text-white">Kwai</SelectItem>
                  <SelectItem value="YouTube" className="text-white">YouTube</SelectItem>
                  <SelectItem value="Instagram" className="text-white">Instagram</SelectItem>
                  <SelectItem value="Facebook" className="text-white">Facebook</SelectItem>
                  <SelectItem value="Shopify" className="text-white">Shopify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AccountStatusSelector value={accountStatus} onChange={setAccountStatus} />

            {plataforma !== "Shopify" && <div className="space-y-2">
                <Label htmlFor="edit-engajamento" className="text-gray-300">Engajamento</Label>
                <Select value={engajamento} onValueChange={(value: 'Alto' | 'Médio' | 'Baixo') => setEngajamento(value)}>
                  <SelectTrigger id="edit-engajamento" className="glass-card border-tech-accent/20 text-white">
                    <SelectValue placeholder="Selecione o engajamento" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-tech-accent/20">
                    <SelectItem value="Alto" className="text-white">Alto</SelectItem>
                    <SelectItem value="Médio" className="text-white">Médio</SelectItem>
                    <SelectItem value="Baixo" className="text-white">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>}

            {plataforma === "TikTok" && <div className="space-y-2">
                <Label className="text-gray-300">TikTok Shop</Label>
                <RadioGroup value={tiktokShop} onValueChange={(value: 'Sim' | 'Não') => setTiktokShop(value)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="edit-tiktok-shop-sim" />
                    <Label htmlFor="edit-tiktok-shop-sim" className="text-gray-300">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="edit-tiktok-shop-nao" />
                    <Label htmlFor="edit-tiktok-shop-nao" className="text-gray-300">Não</Label>
                  </div>
                </RadioGroup>
              </div>}

            {/* Monetizada - para todas as contas exceto Shopify */}
            {plataforma !== "Shopify" && <div className="space-y-2">
                <Label className="text-gray-300">Monetizada</Label>
                <RadioGroup value={monetizada} onValueChange={(value: 'Sim' | 'Não') => setMonetizada(value)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="edit-monetizada-sim" />
                    <Label htmlFor="edit-monetizada-sim" className="text-gray-300">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="edit-monetizada-nao" />
                    <Label htmlFor="edit-monetizada-nao" className="text-gray-300">Não</Label>
                  </div>
                </RadioGroup>
              </div>}

            {/* Shopify specific fields in edit modal */}
            {plataforma === "Shopify" && <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-descricaoLoja" className="text-gray-300">Descrição da Loja</Label>
                  <Textarea id="edit-descricaoLoja" value={descricaoLoja} onChange={e => setDescricaoLoja(e.target.value)} placeholder="Descreva os produtos, público-alvo e características da loja..." rows={3} className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-vendasMensais" className="text-gray-300">Vendas Mensais</Label>
                  <Input id="edit-vendasMensais" value={vendasMensais} onChange={e => setVendasMensais(e.target.value)} placeholder="Ex: R$ 5.000 - R$ 10.000" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-produtosCadastrados" className="text-gray-300">Produtos Cadastrados</Label>
                  <Input id="edit-produtosCadastrados" type="number" value={produtosCadastrados} onChange={e => setProdutosCadastrados(e.target.value)} placeholder="Ex: 150" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-trafegoMensal" className="text-gray-300">Tráfego Mensal</Label>
                  <Input id="edit-trafegoMensal" value={trafegoMensal} onChange={e => setTrafegoMensal(e.target.value)} placeholder="Ex: 10.000 visitantes" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-integracoesAtivas" className="text-gray-300">Integrações Ativas</Label>
                  <Input id="edit-integracoesAtivas" value={integracoesAtivas} onChange={e => setIntegracoesAtivas(e.target.value)} placeholder="Ex: Stripe, PagSeguro, Google Analytics" className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-dominioIncluso" checked={dominioIncluso} onCheckedChange={checked => setDominioIncluso(checked as boolean)} />
                    <Label htmlFor="edit-dominioIncluso" className="text-gray-300">Domínio incluso</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-lojaPronta" checked={lojaPronta} onCheckedChange={checked => setLojaPronta(checked as boolean)} />
                    <Label htmlFor="edit-lojaPronta" className="text-gray-300">Loja pronta para rodar</Label>
                  </div>
                </div>
              </>}
            
            <div className="space-y-2">
              <Label htmlFor="edit-preco" className="text-gray-300">Preço (R$)</Label>
              <Input id="edit-preco" type="number" value={preco} onChange={e => setPreco(e.target.value)} className="glass-card border-tech-accent/20 text-white" />
            </div>
            
            {/* Campo de upload de screenshot da conta no modal de edição */}
            <div className="space-y-2 md:col-span-2">
              <AccountScreenshotUpload
                currentImageUrl={profileImageUrl}
                onImageUpload={setProfileImageUrl}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-login" className="text-gray-300">{plataforma === "Shopify" ? "Login da Loja" : "Login da Conta"}</Label>
              <Input id="edit-login" value={login} onChange={e => setLogin(e.target.value)} className="glass-card border-tech-accent/20 text-white" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-senha" className="text-gray-300">{plataforma === "Shopify" ? "Senha da Loja" : "Senha da Conta"}</Label>
              <div className="relative">
                <Input 
                  id="edit-senha" 
                  type={showEditPassword ? "text" : "password"} 
                  value={senha} 
                  onChange={e => setSenha(e.target.value)} 
                  className="glass-card border-tech-accent/20 text-white pr-10" 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={isLoading} className="text-gray-300 hover:bg-tech-accent/10">
              Cancelar
            </Button>
            <Button onClick={handleUpdateAccount} className="tech-gradient hover:shadow-glow text-white" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>;
};
export default AdminPanel;
