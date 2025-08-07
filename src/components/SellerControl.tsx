import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/helpers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, DollarSign, TrendingUp, Users, Eye, Edit, Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";

interface SellerData {
  id: string;
  name: string;
  email: string;
  is_approved_seller: boolean;
  seller_sales_blocked: boolean;
  created_at: string;
  accounts_count: number;
  sold_accounts_count: number;
  total_revenue: number;
  pending_withdrawals: number;
  completed_withdrawals: number;
  classification: "Ouro" | "Prata" | "Bronze";
}

interface WithdrawalRequest {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_email: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  processed_at?: string;
}

const SellerControl = () => {
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchSellersData();
    fetchWithdrawalRequests();
  }, []);

  const getSellerClassification = (totalRevenue: number, soldAccounts: number): "Ouro" | "Prata" | "Bronze" => {
    if (totalRevenue >= 10000 && soldAccounts >= 50) return "Ouro";
    if (totalRevenue >= 5000 && soldAccounts >= 25) return "Prata";
    return "Bronze";
  };

  const fetchSellersData = async () => {
    try {
      setLoading(true);
      
      // Buscar vendedores aprovados
      const { data: sellersData, error: sellersError } = await supabase
        .from('users')
        .select('id, name, email, is_approved_seller, seller_sales_blocked, created_at')
        .eq('is_approved_seller', true);

      if (sellersError) throw sellersError;

      // Para cada vendedor, buscar estatísticas
      const sellersWithStats = await Promise.all(
        sellersData?.map(async (seller) => {
          // Contas cadastradas pelo vendedor
          const { count: accountsCount } = await supabase
            .from('accounts')
            .select('*', { count: 'exact', head: true })
            .eq('vendedor_id', seller.id);

          // Contas vendidas pelo vendedor
          const { count: soldAccountsCount } = await supabase
            .from('accounts')
            .select('*', { count: 'exact', head: true })
            .eq('vendedor_id', seller.id)
            .eq('status', 'vendido');

           // Buscar contas vendidas e calcular receita real
           const { data: soldAccountsData } = await supabase
             .from('accounts')
             .select('preco')
             .eq('vendedor_id', seller.id)
             .eq('status', 'vendido');

           // Calcular receita total real (vendedor recebe 90% do valor)
           const totalRevenue = soldAccountsData?.reduce((sum, account) => 
             sum + (account.preco || 0) * 0.9, 0) || 0;

           // Buscar saques pendentes
           const { data: pendingWithdrawalsData } = await supabase
             .from('withdrawal_requests')
             .select('amount')
             .eq('seller_id', seller.id)
             .eq('status', 'pending');

           const pendingWithdrawals = pendingWithdrawalsData?.reduce((sum, request) => 
             sum + (request.amount || 0), 0) || 0;

           // Buscar saques concluídos (aprovados e processados)
           const { data: completedWithdrawalsData } = await supabase
             .from('withdrawal_requests')
             .select('amount')
             .eq('seller_id', seller.id)
             .in('status', ['approved', 'processed']);

           const completedWithdrawals = completedWithdrawalsData?.reduce((sum, request) => 
             sum + (request.amount || 0), 0) || 0;

          const classification = getSellerClassification(totalRevenue, soldAccountsCount || 0);

          return {
            ...seller,
            accounts_count: accountsCount || 0,
            sold_accounts_count: soldAccountsCount || 0,
            total_revenue: totalRevenue,
            pending_withdrawals: pendingWithdrawals,
            completed_withdrawals: completedWithdrawals,
            classification
          };
        }) || []
      );

      setSellers(sellersWithStats);
    } catch (error) {
      console.error('Erro ao buscar dados dos vendedores:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados dos vendedores."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      // Buscar solicitações de saque reais com dados do vendedor
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Buscar dados dos vendedores para cada solicitação
      const sellerIds = [...new Set(withdrawals?.map(w => w.seller_id) || [])];
      const { data: sellers, error: sellersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', sellerIds);

      if (sellersError) throw sellersError;

      // Combinar dados
      const sellersMap = new Map(sellers?.map(seller => [seller.id, seller]) || []);
      
      const formattedRequests = withdrawals?.map((request: any) => {
        const seller = sellersMap.get(request.seller_id);
        return {
          id: request.id,
          seller_id: request.seller_id,
          seller_name: seller?.name || 'Nome não disponível',
          seller_email: seller?.email || 'Email não disponível',
          amount: request.amount,
          status: request.status,
          created_at: request.requested_at,
          processed_at: request.processed_at,
        };
      }) || [];
      
      setWithdrawalRequests(formattedRequests);
    } catch (error) {
      console.error('Erro ao buscar solicitações de saque:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as solicitações de saque."
      });
    }
  };

  const handleBlockSeller = async (sellerId: string, block: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ seller_sales_blocked: block })
        .eq('id', sellerId);

      if (error) throw error;

      setSellers(sellers.map(seller => 
        seller.id === sellerId 
          ? { ...seller, seller_sales_blocked: block }
          : seller
      ));

      toast({
        title: block ? "Vendedor bloqueado" : "Vendedor desbloqueado",
        description: `O vendedor foi ${block ? 'bloqueado' : 'desbloqueado'} com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao alterar status do vendedor:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o status do vendedor."
      });
    }
  };

  const handleWithdrawalAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      // Buscar dados do usuário admin atual
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
        })
        .eq('id', requestId);

      if (error) throw error;

      // Atualizar estado local
      setWithdrawalRequests(requests => 
        requests.map(request => 
          request.id === requestId 
            ? { ...request, status: action, processed_at: new Date().toISOString() }
            : request
        )
      );

      toast({
        title: action === 'approved' ? "Saque aprovado" : "Saque rejeitado",
        description: `A solicitação foi ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`
      });

      // Recarregar dados dos vendedores para atualizar estatísticas
      fetchSellersData();
      
    } catch (error) {
      console.error('Erro ao processar solicitação de saque:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível processar a solicitação."
      });
    }
  };
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClassification = classificationFilter === "all" || 
                                 seller.classification.toLowerCase() === classificationFilter;
    
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "active" && !seller.seller_sales_blocked) ||
                         (statusFilter === "blocked" && seller.seller_sales_blocked);

    return matchesSearch && matchesClassification && matchesStatus;
  });

  const getClassificationBadge = (classification: string) => {
    const variants = {
      "Ouro": "bg-yellow-500/20 text-yellow-400 border-yellow-400",
      "Prata": "bg-gray-500/20 text-gray-400 border-gray-400",
      "Bronze": "bg-orange-500/20 text-orange-400 border-orange-400"
    };
    
    return variants[classification as keyof typeof variants] || variants.Bronze;
  };

  const totalStats = {
    totalSellers: sellers.length,
    activeSellers: sellers.filter(s => !s.seller_sales_blocked).length,
    blockedSellers: sellers.filter(s => s.seller_sales_blocked).length,
    totalRevenue: sellers.reduce((sum, s) => sum + s.total_revenue, 0),
    totalSoldAccounts: sellers.reduce((sum, s) => sum + s.sold_accounts_count, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-tech-highlight" />
        <span className="ml-2 text-white">Carregando dados dos vendedores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tech-light text-sm">Total de Vendedores</p>
                <p className="text-2xl font-bold text-white">{totalStats.totalSellers}</p>
              </div>
              <Users className="h-8 w-8 text-tech-highlight" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tech-light text-sm">Vendedores Ativos</p>
                <p className="text-2xl font-bold text-green-400">{totalStats.activeSellers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tech-light text-sm">Vendedores Bloqueados</p>
                <p className="text-2xl font-bold text-red-400">{totalStats.blockedSellers}</p>
              </div>
              <Users className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tech-light text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-tech-highlight">{formatCurrency(totalStats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-tech-highlight" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tech-light text-sm">Contas Vendidas</p>
                <p className="text-2xl font-bold text-white">{totalStats.totalSoldAccounts}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sellers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sellers">Vendedores</TabsTrigger>
          <TabsTrigger value="withdrawals">Solicitações de Saque</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="sellers" className="space-y-4">
          {/* Filtros */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-light h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-tech-darker border-tech-border text-white"
                    />
                  </div>
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full lg:w-48 bg-tech-darker border-tech-border text-white">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as classificações</SelectItem>
                    <SelectItem value="ouro">Ouro</SelectItem>
                    <SelectItem value="prata">Prata</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48 bg-tech-darker border-tech-border text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Vendedores */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-white">
                Vendedores Registrados ({filteredSellers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-tech-border">
                      <TableHead className="text-tech-light">Vendedor</TableHead>
                      <TableHead className="text-tech-light">Classificação</TableHead>
                      <TableHead className="text-tech-light">Contas Cadastradas</TableHead>
                      <TableHead className="text-tech-light">Contas Vendidas</TableHead>
                      <TableHead className="text-tech-light">Valor Gerado</TableHead>
                      <TableHead className="text-tech-light">Status</TableHead>
                      <TableHead className="text-tech-light">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSellers.map((seller) => (
                      <TableRow key={seller.id} className="border-tech-border">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{seller.name}</p>
                            <p className="text-tech-light text-sm">{seller.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getClassificationBadge(seller.classification)}>
                            {seller.classification}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{seller.accounts_count}</TableCell>
                        <TableCell className="text-white">{seller.sold_accounts_count}</TableCell>
                        <TableCell className="text-tech-highlight font-medium">
                          {formatCurrency(seller.total_revenue)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={seller.seller_sales_blocked ? "destructive" : "default"}
                            className={seller.seller_sales_blocked 
                              ? "bg-red-500/20 text-red-400" 
                              : "bg-green-500/20 text-green-400"
                            }
                          >
                            {seller.seller_sales_blocked ? "Bloqueado" : "Ativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-tech-border hover:bg-tech-darker"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockSeller(seller.id, !seller.seller_sales_blocked)}
                              className={`h-8 border-tech-border hover:bg-tech-darker ${
                                seller.seller_sales_blocked 
                                  ? "text-green-400 hover:text-green-300" 
                                  : "text-red-400 hover:text-red-300"
                              }`}
                            >
                              {seller.seller_sales_blocked ? "Desbloquear" : "Bloquear"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-white">Solicitações de Saque</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-tech-light">
                    Nenhuma solicitação de saque encontrada.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-tech-border">
                        <TableHead className="text-tech-light">Vendedor</TableHead>
                        <TableHead className="text-tech-light">Valor</TableHead>
                        <TableHead className="text-tech-light">Data Solicitação</TableHead>
                        <TableHead className="text-tech-light">Status</TableHead>
                        <TableHead className="text-tech-light">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalRequests.map((request) => (
                        <TableRow key={request.id} className="border-tech-border">
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{request.seller_name}</p>
                              <p className="text-tech-light text-sm">{request.seller_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-tech-highlight font-bold">
                            {formatCurrency(request.amount)}
                          </TableCell>
                          <TableCell className="text-white">
                            {new Date(request.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' : 
                                request.status === 'rejected' ? 'destructive' : 
                                'secondary'
                              }
                              className={
                                request.status === 'approved' ? "bg-green-500/20 text-green-400" :
                                request.status === 'rejected' ? "bg-red-500/20 text-red-400" :
                                "bg-yellow-500/20 text-yellow-400"
                              }
                            >
                              {request.status === 'approved' ? 'Aprovado' :
                               request.status === 'rejected' ? 'Rejeitado' :
                               'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleWithdrawalAction(request.id, 'approved')}
                                  className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30"
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleWithdrawalAction(request.id, 'rejected')}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            ) : (
                              <span className="text-tech-light text-sm">
                                {request.processed_at && 
                                  `Processado em ${new Date(request.processed_at).toLocaleDateString('pt-BR')}`
                                }
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-white">Ranking de Vendedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-tech-border">
                      <TableHead className="text-tech-light">Posição</TableHead>
                      <TableHead className="text-tech-light">Vendedor</TableHead>
                      <TableHead className="text-tech-light">Total de Vendas</TableHead>
                      <TableHead className="text-tech-light">Valor Gerado</TableHead>
                      <TableHead className="text-tech-light">Classificação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...filteredSellers]
                      .sort((a, b) => b.total_revenue - a.total_revenue)
                      .map((seller, index) => (
                        <TableRow key={seller.id} className="border-tech-border">
                          <TableCell>
                            <Badge 
                              className={`${
                                index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                index === 1 ? "bg-gray-500/20 text-gray-400" :
                                index === 2 ? "bg-orange-500/20 text-orange-400" :
                                "bg-tech-border text-tech-light"
                              }`}
                            >
                              {index + 1}º
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{seller.name}</p>
                              <p className="text-tech-light text-sm">{seller.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{seller.sold_accounts_count}</TableCell>
                          <TableCell className="text-tech-highlight font-medium">
                            {formatCurrency(seller.total_revenue)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getClassificationBadge(seller.classification)}>
                              {seller.classification}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerControl;