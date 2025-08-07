import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Percent, DollarSign, Users, Settings, Save, RotateCcw } from "lucide-react";

interface SellerCommission {
  id?: string;
  seller_id: string;
  commission_percentage: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  seller?: {
    name: string;
    email: string;
  };
}

interface Seller {
  id: string;
  name: string;
  email: string;
  is_approved_seller: boolean;
}

const CommissionManager = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [commissions, setCommissions] = useState<SellerCommission[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>("");
  const [commissionValue, setCommissionValue] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<SellerCommission | null>(null);
  const { toast } = useToast();

  const commissionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  useEffect(() => {
    fetchSellers();
    fetchCommissions();
  }, []);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, is_approved_seller')
        .eq('is_approved_seller', true)
        .order('name');

      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os vendedores.",
      });
    }
  };

  const fetchCommissions = async () => {
    try {
      // Buscar comissões
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('seller_commissions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      if (commissionsData && commissionsData.length > 0) {
        // Buscar dados dos vendedores
        const sellerIds = commissionsData.map(c => c.seller_id);
        const { data: sellersData, error: sellersError } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', sellerIds);

        if (sellersError) throw sellersError;

        // Combinar dados
        const commissionsWithSellers = commissionsData.map(commission => ({
          ...commission,
          seller: sellersData?.find(seller => seller.id === commission.seller_id) || {
            name: 'Vendedor não encontrado',
            email: 'N/A'
          }
        }));

        setCommissions(commissionsWithSellers);
      } else {
        setCommissions([]);
      }
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      toast({
        variant: "destructive",
        title: "Erro", 
        description: "Não foi possível carregar as comissões.",
      });
    }
  };

  const handleSaveCommission = async () => {
    if (!selectedSeller || commissionValue < 1 || commissionValue > 15) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Selecione um vendedor e defina uma comissão entre 1% e 15%.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('seller_commissions')
        .upsert({
          seller_id: selectedSeller,
          commission_percentage: commissionValue,
          updated_by: currentUser.user?.id
        }, {
          onConflict: 'seller_id'
        });

      if (error) throw error;

      toast({
        title: "Comissão salva",
        description: `Comissão de ${commissionValue}% definida com sucesso.`,
      });

      setSelectedSeller("");
      setCommissionValue(10);
      fetchCommissions();
    } catch (error) {
      console.error('Erro ao salvar comissão:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar a comissão.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCommission = (commission: SellerCommission) => {
    setEditingCommission(commission);
    setCommissionValue(commission.commission_percentage);
    setIsEditModalOpen(true);
  };

  const handleUpdateCommission = async () => {
    if (!editingCommission || commissionValue < 1 || commissionValue > 15) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Defina uma comissão entre 1% e 15%.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('seller_commissions')
        .update({
          commission_percentage: commissionValue,
          updated_by: currentUser.user?.id
        })
        .eq('id', editingCommission.id);

      if (error) throw error;

      toast({
        title: "Comissão atualizada",
        description: `Comissão atualizada para ${commissionValue}% com sucesso.`,
      });

      setIsEditModalOpen(false);
      setEditingCommission(null);
      setCommissionValue(10);
      fetchCommissions();
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a comissão.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async (sellerId: string) => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('seller_commissions')
        .upsert({
          seller_id: sellerId,
          commission_percentage: 10,
          updated_by: currentUser.user?.id
        }, {
          onConflict: 'seller_id'
        });

      if (error) throw error;

      toast({
        title: "Comissão resetada",
        description: "Comissão resetada para 10% (padrão).",
      });

      fetchCommissions();
    } catch (error) {
      console.error('Erro ao resetar comissão:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível resetar a comissão.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToAllSellers = async () => {
    if (commissionValue < 1 || commissionValue > 15) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Defina uma comissão entre 1% e 15%.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      // Aplicar a mesma comissão para todos os vendedores usando upsert com on_conflict
      for (const seller of sellers) {
        const { error } = await supabase
          .from('seller_commissions')
          .upsert({
            seller_id: seller.id,
            commission_percentage: commissionValue,
            updated_by: currentUser.user?.id
          }, {
            onConflict: 'seller_id'
          });

        if (error) {
          console.error(`Erro ao aplicar comissão para vendedor ${seller.id}:`, error);
        }
      }

      toast({
        title: "Comissão aplicada",
        description: `Comissão de ${commissionValue}% aplicada para todos os ${sellers.length} vendedores.`,
      });

      fetchCommissions();
    } catch (error) {
      console.error('Erro ao aplicar comissão para todos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível aplicar a comissão para todos os vendedores.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sellersWithoutCommission = sellers.filter(
    seller => !commissions.find(c => c.seller_id === seller.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-tech-accent" />
        <h2 className="text-2xl font-bold text-white">Configurações de Comissão</h2>
      </div>

      {/* Card de informações */}
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Sistema de Comissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="p-4 bg-tech-darker/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">📊 Faixa de Comissão</h4>
              <p>Definição entre 1% e 15% por vendedor</p>
            </div>
            <div className="p-4 bg-tech-darker/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">🎯 Comissão Padrão</h4>
              <p>10% aplicado automaticamente</p>
            </div>
            <div className="p-4 bg-tech-darker/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">💡 Aplicação</h4>
              <p>Apenas vendas futuras são afetadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Definir nova comissão */}
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Definir Comissão do Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Vendedor</Label>
              <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  {sellersWithoutCommission.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id} className="text-white hover:bg-tech-border">
                      {seller.name} ({seller.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Percentual de Comissão</Label>
              <Select 
                value={commissionValue.toString()} 
                onValueChange={(value) => setCommissionValue(Number(value))}
              >
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  {commissionOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()} className="text-white hover:bg-tech-border">
                      {option}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Ação</Label>
              <Button
                onClick={handleSaveCommission}
                disabled={loading || !selectedSeller}
                className="w-full bg-tech-accent hover:bg-tech-accent/80"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Comissão
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aplicar comissão para todos os vendedores */}
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aplicar Comissão para Todos os Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Total de Vendedores</Label>
              <div className="bg-tech-darker border-tech-border text-white px-3 py-2 rounded-md">
                {sellers.length} vendedores
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Percentual de Comissão</Label>
              <Select 
                value={commissionValue.toString()} 
                onValueChange={(value) => setCommissionValue(Number(value))}
              >
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  {commissionOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()} className="text-white hover:bg-tech-border">
                      {option}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Ação</Label>
              <Button
                onClick={handleApplyToAllSellers}
                disabled={loading || sellers.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Aplicar para Todos
              </Button>
            </div>
          </div>
          
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <strong>Atenção:</strong> Esta ação aplicará a comissão de {commissionValue}% para todos os {sellers.length} vendedores aprovados, sobrescrevendo configurações individuais existentes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de comissões configuradas */}
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Comissões Configuradas ({commissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-tech-border">
                    <TableHead className="text-gray-300">Vendedor</TableHead>
                    <TableHead className="text-gray-300">E-mail</TableHead>
                    <TableHead className="text-gray-300">Comissão</TableHead>
                    <TableHead className="text-gray-300">Última Atualização</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id} className="border-tech-border hover:bg-tech-darker/50">
                      <TableCell className="text-white font-medium">
                        {commission.seller?.name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {commission.seller?.email}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            commission.commission_percentage === 10 
                              ? 'border-green-500 text-green-400' 
                              : 'border-tech-accent text-tech-accent'
                          }`}
                        >
                          {formatPercentage(commission.commission_percentage)}
                          {commission.commission_percentage === 10 && ' (Padrão)'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {commission.updated_at && formatDate(commission.updated_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCommission(commission)}
                            className="border-tech-border text-white hover:bg-tech-border"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetToDefault(commission.seller_id)}
                            disabled={commission.commission_percentage === 10}
                            className="border-tech-border text-white hover:bg-tech-border"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Resetar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Percent className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma comissão personalizada configurada</p>
              <p className="text-sm text-gray-500 mt-2">
                Todos os vendedores estão usando a comissão padrão de 10%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-tech-secondary border-tech-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              Editar Comissão - {editingCommission?.seller?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Altere o percentual de comissão para este vendedor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Novo Percentual de Comissão</Label>
              <Select 
                value={commissionValue.toString()} 
                onValueChange={(value) => setCommissionValue(Number(value))}
              >
                <SelectTrigger className="bg-tech-darker border-tech-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-tech-darker border-tech-border">
                  {commissionOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()} className="text-white hover:bg-tech-border">
                      {option}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-tech-border text-white hover:bg-tech-border"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateCommission}
              disabled={loading}
              className="bg-tech-accent hover:bg-tech-accent/80"
            >
              <Save className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommissionManager;