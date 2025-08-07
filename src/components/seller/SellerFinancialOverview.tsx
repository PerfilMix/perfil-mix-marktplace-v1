import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, Eye, CalendarIcon, Filter, Star, MessageSquare } from "lucide-react";
import WithdrawalRequest from "@/components/WithdrawalRequest";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FinancialData {
  availableBalance: number;
  totalSales: number;
  accountsSold: number;
}

interface SaleRecord {
  id: string;
  data_compra: string;
  conta: {
    nome: string;
    plataforma: string;
    preco: number;
    seguidores: number;
  };
  usuario: {
    email: string;
  };
}

interface RatingData {
  average_rating: number | null;
  total_ratings: number;
  display_rating: boolean;
  minimum_reached: boolean;
}

const SellerFinancialOverview = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    availableBalance: 0,
    totalSales: 0,
    accountsSold: 0,
  });
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [quickFilter, setQuickFilter] = useState<'today' | 'week' | 'month' | 'all' | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const { user, userProfile } = useAuth();

  // Verificar se o vendedor está bloqueado
  const isSellerBlocked = userProfile?.is_approved_seller && userProfile?.seller_sales_blocked;

  // Debug: Log do estado do vendedor
  console.log('SellerFinancialOverview - User Profile:', userProfile);
  console.log('SellerFinancialOverview - Is Seller Blocked:', isSellerBlocked);
  console.log('SellerFinancialOverview - is_approved_seller:', userProfile?.is_approved_seller);
  console.log('SellerFinancialOverview - seller_sales_blocked:', userProfile?.seller_sales_blocked);

  useEffect(() => {
    if (user) {
      fetchFinancialData();
      fetchSellerRatings();
    }
  }, [user, dateFrom, dateTo]);

  const fetchFinancialData = async () => {
    if (!user) return;
    
    try {
      // Construir query base para dados financeiros
      let financialQuery = supabase
        .from('accounts')
        .select('preco')
        .eq('vendedor_id', user.id)
        .eq('status', 'vendido');

      // Aplicar filtros de data se definidos
      if (dateFrom) {
        financialQuery = financialQuery.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        financialQuery = financialQuery.lte('created_at', endDate.toISOString());
      }

      const { data: soldAccounts, error: financialError } = await financialQuery;

      if (financialError) {
        console.error('Erro ao buscar dados financeiros:', financialError);
        return;
      }

      // Buscar comissão personalizada ou usar 10% padrão
      const { data: commissionData } = await supabase
        .rpc('get_seller_commission', { seller_user_id: user.id });
      
      const commissionRate = (commissionData || 10) / 100;

      // Calcular dados financeiros
      let totalSales = 0;
      let availableBalance = 0;
      const accountsSold = soldAccounts?.length || 0;

      soldAccounts?.forEach((account) => {
        if (account.preco) {
          const salePrice = account.preco;
          totalSales += salePrice;
          
          const adminCommission = salePrice * commissionRate;
          const availableAmount = salePrice - adminCommission;
          
          availableBalance += availableAmount;
        }
      });

      // Buscar todos os saques (pendentes, aprovados e processados) para deduzir do saldo
      const { data: allWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('amount, status')
        .eq('seller_id', user.id)
        .in('status', ['pending', 'approved', 'processed']);
      
      if (withdrawalsError) {
        console.error('Erro ao buscar saques:', withdrawalsError);
      } else {
        // Deduzir todos os saques (pendentes, aprovados e processados) do saldo disponível
        const totalWithdrawn = allWithdrawals?.reduce((sum, request) => 
          sum + (request.amount || 0), 0) || 0;
        
        availableBalance -= totalWithdrawn;
      }

      setFinancialData({
        availableBalance,
        totalSales,
        accountsSold,
      });

      // Query para o histórico de vendas usando accounts vendidas pelo vendedor
      let salesQuery = supabase
        .from('accounts')
        .select(`
          id,
          nome,
          plataforma,
          preco,
          seguidores,
          created_at,
          comprada_por,
          vendedor_id
        `)
        .eq('status', 'vendido')
        .eq('vendedor_id', user.id)
        .order('created_at', { ascending: false });

      // Aplicar filtros de data se definidos
      if (dateFrom) {
        salesQuery = salesQuery.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        salesQuery = salesQuery.lte('created_at', endDate.toISOString());
      }

      const { data: salesAccounts, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('Erro ao buscar histórico de vendas:', salesError);
        setSales([]);
        return;
      }

      console.log('Contas vendidas encontradas:', salesAccounts);

      // Se há vendas, buscar informações dos compradores
      if (salesAccounts && salesAccounts.length > 0) {
        // Extrair IDs únicos dos compradores
        const buyerIds = [...new Set(salesAccounts.map((account: any) => account.comprada_por).filter(Boolean))];
        
        // Buscar informações dos compradores
        const { data: buyers, error: buyersError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', buyerIds);

        if (buyersError) {
          console.error('Erro ao buscar compradores:', buyersError);
        }

        console.log('Compradores encontrados:', buyers);

        // Transformar dados para o formato esperado
        const salesData = salesAccounts?.map((account: any) => {
          const buyer = buyers?.find((b: any) => b.id === account.comprada_por);
          return {
            id: account.id,
            data_compra: account.created_at,
            conta: {
              nome: account.nome || 'N/A',
              plataforma: account.plataforma || 'N/A',
              preco: account.preco || 0,
              seguidores: account.seguidores || 0,
            },
            usuario: {
              email: buyer?.email || 'Email não disponível',
            },
          };
        });

        setSales(salesData || []);
      } else {
        setSales([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerRatings = async () => {
    if (!user) return;

    try {
      // Buscar média de avaliações
      const { data: avgData, error: avgError } = await supabase
        .rpc('get_seller_average_rating', { seller_user_id: user.id });

      if (avgError) {
        console.error("Erro ao buscar média:", avgError);
        setError("Erro ao carregar avaliações");
      } else {
        const ratingData = avgData as unknown as RatingData;
        setAverageRating(ratingData?.average_rating || null);
        setError(null);
      }

      // Buscar total de avaliações
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('seller_ratings')
        .select('id')
        .eq('seller_id', user.id);

      if (ratingsError) {
        console.error("Erro ao buscar avaliações:", ratingsError);
      } else {
        setTotalRatings(ratingsData?.length || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar dados de avaliações:", error);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4", 
      lg: "h-5 w-5"
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-600'
        }`}
      />
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFollowers = (followers: number) => {
    if (followers >= 1000000) {
      return `${(followers / 1000000).toFixed(1)}M`;
    } else if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`;
    }
    return followers.toString();
  };

  const calculateSellerEarnings = (salePrice: number, commissionRate = 0.10) => {
    // Valor disponível = preço total - comissão da plataforma
    return salePrice * (1 - commissionRate);
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setQuickFilter(null);
  };

  const applyQuickFilter = (filterType: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date();
    setQuickFilter(filterType);
    
    switch (filterType) {
      case 'today':
        setDateFrom(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
        setDateTo(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        setDateFrom(weekStart);
        setDateTo(now);
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setDateFrom(monthStart);
        setDateTo(now);
        break;
      case 'all':
        setDateFrom(undefined);
        setDateTo(undefined);
        break;
    }
  };

  const applyDateFilter = () => {
    setQuickFilter(null);
    // A funcionalidade já está sendo aplicada automaticamente no useEffect
  };

  const cards = [
    {
      title: "Saldo Disponível",
      value: formatCurrency(financialData.availableBalance),
      description: "Valor disponível após comissão",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total em Vendas",
      value: formatCurrency(financialData.totalSales),
      description: "Valor total vendido",
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Contas Vendidas",
      value: financialData.accountsSold.toString(),
      description: "Total de contas vendidas",
      icon: Eye,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avaliação Média",
      value: averageRating ? averageRating.toFixed(1) : "N/A",
      description: `${totalRatings} ${totalRatings === 1 ? 'avaliação' : 'avaliações'}`,
      icon: Star,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      isRating: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-tech-secondary border-tech-border">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-tech-border rounded mb-2"></div>
                <div className="h-8 bg-tech-border rounded mb-2"></div>
                <div className="h-3 bg-tech-border rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mensagem de Vendedor Bloqueado */}
      {isSellerBlocked && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <MessageSquare className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">
                  Programa de Vendedores
                </h3>
                <p className="text-amber-300/90 text-sm mb-3">
                  Status da sua solicitação: <span className="font-medium">Aprovado</span>
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <h4 className="text-amber-400 font-medium mb-2">
                    🔒 Conta Temporariamente em Análise
                  </h4>
                  <p className="text-amber-300/80 text-sm leading-relaxed">
                    Sua conta de vendedor está passando por uma análise de rotina para garantir a qualidade e segurança da nossa plataforma. 
                    Durante este período, você pode visualizar suas informações financeiras, mas as funções de cadastro e gestão de contas estão temporariamente suspensas.
                  </p>
                  <div className="mt-3 p-3 bg-amber-500/5 rounded border border-amber-500/10">
                    <p className="text-amber-300/90 text-xs">
                      ✅ <strong>Em breve retornaremos o acesso completo à sua conta</strong><br/>
                      📞 Qualquer dúvida, entre em contato com nosso suporte
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros de Data */}
      <Card className="bg-filter-background border-border/40 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros Rápidos */}
            <div className="lg:col-span-2">
              <label className="text-tech-light text-sm font-medium mb-3 block">Período Rápido</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => applyQuickFilter('today')}
                  variant={quickFilter === 'today' ? 'default' : 'outline'}
                  className={cn(
                    "h-10 text-sm",
                    quickFilter === 'today' 
                      ? "bg-tech-highlight text-white" 
                      : "bg-tech-darker border-tech-border text-white hover:bg-tech-border"
                  )}
                >
                  Hoje
                </Button>
                <Button
                  onClick={() => applyQuickFilter('week')}
                  variant={quickFilter === 'week' ? 'default' : 'outline'}
                  className={cn(
                    "h-10 text-sm",
                    quickFilter === 'week' 
                      ? "bg-tech-highlight text-white" 
                      : "bg-tech-darker border-tech-border text-white hover:bg-tech-border"
                  )}
                >
                  Esta Semana
                </Button>
                <Button
                  onClick={() => applyQuickFilter('month')}
                  variant={quickFilter === 'month' ? 'default' : 'outline'}
                  className={cn(
                    "h-10 text-sm",
                    quickFilter === 'month' 
                      ? "bg-tech-highlight text-white" 
                      : "bg-tech-darker border-tech-border text-white hover:bg-tech-border"
                  )}
                >
                  Este Mês
                </Button>
                <Button
                  onClick={() => applyQuickFilter('all')}
                  variant={quickFilter === 'all' ? 'default' : 'outline'}
                  className={cn(
                    "h-10 text-sm",
                    quickFilter === 'all' 
                      ? "bg-tech-highlight text-white" 
                      : "bg-tech-darker border-tech-border text-white hover:bg-tech-border"
                  )}
                >
                  Todo Período
                </Button>
              </div>
            </div>

            {/* Data Personalizada */}
            <div className="space-y-3">
              <label className="text-tech-light text-sm font-medium block">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-tech-darker border-tech-border text-white hover:bg-tech-border",
                      !dateFrom && "text-tech-light"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <label className="text-tech-light text-sm font-medium block">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-tech-darker border-tech-border text-white hover:bg-tech-border",
                      !dateTo && "text-tech-light"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Ações dos Filtros */}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={clearFilters}
              variant="outline"
              className="bg-tech-darker border-tech-border text-white hover:bg-tech-border"
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
            {(dateFrom || dateTo) && (
              <Button 
                onClick={applyDateFilter}
                className="bg-tech-highlight hover:bg-tech-highlight/80 text-white"
              >
                Aplicar Período
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards Financeiros */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-tech-secondary border-tech-border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-tech-border rounded mb-2"></div>
                  <div className="h-8 bg-tech-border rounded mb-2"></div>
                  <div className="h-3 bg-tech-border rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="bg-tech-secondary border-tech-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-tech-light">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-2xl font-bold text-white">
                      {card.value}
                    </div>
                    {card.isRating && averageRating && (
                      <div className="flex items-center gap-1">
                        {renderStars(averageRating, "sm")}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-tech-light">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Seção de Solicitação de Saque - só para vendedores aprovados que não estão bloqueados */}
      {userProfile?.is_approved_seller && !isSellerBlocked && (
        <WithdrawalRequest />
      )}

      {/* Seção de Avaliações Resumida */}
      {totalRatings > 0 && averageRating && (
        <>
          <Separator className="bg-tech-border" />
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Resumo das Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Média de Estrelas */}
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    {renderStars(averageRating, "lg")}
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="text-tech-light text-sm">
                      Avaliação média geral
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-tech-light">Total de Avaliações</span>
                    <span className="text-white font-medium">{totalRatings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-tech-light">Índice de Satisfação</span>
                    <span className="text-white font-medium">
                      {((averageRating / 5) * 100).toFixed(0)}%
                    </span>
                  </div>
                  {averageRating >= 4.5 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-green-400 text-sm font-medium">
                          Vendedor Excelente!
                        </span>
                      </div>
                      <p className="text-green-300 text-xs mt-1">
                        Suas avaliações estão acima de 4.5 estrelas
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Histórico de Vendas */}
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-tech-light py-8">
              Carregando histórico de vendas...
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center text-tech-light py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhuma venda realizada ainda</p>
              <p className="text-sm">Suas vendas aparecerão aqui quando alguém comprar suas contas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-tech-border">
                    <TableHead className="text-tech-light">Data</TableHead>
                    <TableHead className="text-tech-light">Conta</TableHead>
                    <TableHead className="text-tech-light">Plataforma</TableHead>
                    <TableHead className="text-tech-light">Seguidores</TableHead>
                    <TableHead className="text-tech-light">Comprador</TableHead>
                    <TableHead className="text-tech-light">Valor Bruto</TableHead>
                    <TableHead className="text-tech-light">Seus Ganhos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="border-tech-border">
                      <TableCell className="text-tech-light">
                        {formatDate(sale.data_compra)}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {sale.conta?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-tech-highlight text-tech-highlight">
                          {sale.conta?.plataforma || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-tech-light">
                        {sale.conta?.seguidores ? formatFollowers(sale.conta.seguidores) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-tech-light">
                        {sale.usuario?.email || 'N/A'}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {sale.conta?.preco ? formatCurrency(sale.conta.preco) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-green-400 font-medium">
                        {sale.conta?.preco ? formatCurrency(calculateSellerEarnings(sale.conta.preco)) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerFinancialOverview;