import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TikTokAccount } from "@/types";
import ViewAccountModal from "./ViewAccountModal";
import EditAccountModal from "./EditAccountModal";

interface AccountWithSeller extends TikTokAccount {
  seller_name?: string;
}

const SellerAccountsTable = () => {
  const [accounts, setAccounts] = useState<AccountWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<TikTokAccount | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Função para converter dados do banco para o tipo TikTokAccount
  const convertToTikTokAccount = (rawAccount: any): AccountWithSeller => {
    return {
      ...rawAccount,
      status: rawAccount.status as 'disponivel_venda' | 'em_producao' | 'vendido',
      plataforma: rawAccount.plataforma as 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify',
      tiktok_shop: rawAccount.tiktok_shop as 'Sim' | 'Não',
      engajamento: rawAccount.engajamento as 'Alto' | 'Médio' | 'Baixo',
      seller_name: rawAccount.seller_name || 'Vendedor não identificado'
    };
  };

  useEffect(() => {
    if (user) {
      fetchSellerAccounts();
    }
  }, [user]);

  const fetchSellerAccounts = async () => {
    if (!user) return;
    
    try {
      console.log('Buscando contas do vendedor:', user.id);
      
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          seller_name:users!vendedor_id(name)
        `)
        .eq('vendedor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }

      console.log('Contas encontradas:', data);
      const convertedAccounts = (data || []).map((account: any) => convertToTikTokAccount({
        ...account,
        seller_name: account.seller_name?.name || 'Vendedor não identificado'
      }));
      setAccounts(convertedAccounts);
    } catch (error) {
      console.error('Erro ao buscar contas do vendedor:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas contas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAccount = (account: TikTokAccount) => {
    setSelectedAccount(account);
    setIsViewModalOpen(true);
  };

  const handleEditAccount = (account: TikTokAccount) => {
    console.log('handleEditAccount - account received:', account);
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('vendedor_id', user?.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta removida com sucesso",
      });

      // Atualizar a lista de contas
      fetchSellerAccounts();
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conta",
        variant: "destructive",
      });
    }
  };

  const handleAccountUpdate = () => {
    fetchSellerAccounts();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'disponivel_venda':
        return 'default';
      case 'vendido':
        return 'secondary';
      case 'em_producao':
        return 'outline';
      default:
        return 'default';
    }
  };

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

  if (loading) {
    return (
      <Card className="bg-tech-secondary border-tech-border">
        <CardContent className="p-6">
          <div className="text-center text-tech-light">
            Carregando suas contas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="bg-tech-secondary border-tech-border">
        <CardContent className="p-6">
          <div className="text-center text-tech-light">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Nenhuma conta cadastrada ainda</p>
            <p className="text-sm">Adicione sua primeira conta para começar a vender!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-tech-secondary border-tech-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          Minhas Contas ({accounts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-tech-border">
                <TableHead className="text-tech-light">Conta</TableHead>
                <TableHead className="text-tech-light">Plataforma</TableHead>
                <TableHead className="text-tech-light">Seguidores</TableHead>
                <TableHead className="text-tech-light">Nicho</TableHead>
                <TableHead className="text-tech-light">Preço</TableHead>
                <TableHead className="text-tech-light">Status</TableHead>
                <TableHead className="text-tech-light">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="border-tech-border">
                  <TableCell className="text-white font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold">{account.nome}</span>
                      <span className="text-sm text-tech-light">{account.seller_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-tech-highlight text-tech-highlight">
                      {account.plataforma}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-tech-light">
                    {formatFollowers(account.seguidores)}
                  </TableCell>
                  <TableCell className="text-tech-light">
                    {account.nicho}
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {formatPrice(account.preco)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(account.status)}>
                      {getStatusText(account.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {(account.status === 'disponivel_venda' || account.status === 'em_producao') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                            className="h-8 w-8 p-0 text-tech-light hover:text-white hover:bg-tech-darker"
                            title="Editar conta"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {account.status === 'disponivel_venda' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAccount(account.id)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Excluir conta"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Modais */}
      <ViewAccountModal
        account={selectedAccount}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAccount(null);
        }}
      />
      
      <EditAccountModal
        account={selectedAccount}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAccount(null);
        }}
        onUpdate={handleAccountUpdate}
      />
    </Card>
  );
};

export default SellerAccountsTable;
