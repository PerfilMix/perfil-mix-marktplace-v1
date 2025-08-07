import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/helpers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, CheckCircle, XCircle, Clock, Eye, MessageSquare, TrendingUp } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  processed_at?: string;
  seller_name: string;
  seller_email: string;
  chave_pix?: string;
}

const WithdrawalRequestsManager = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalAmount: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      
      // Buscar solicitações com dados do vendedor via join manual
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Buscar dados dos vendedores separadamente
      const sellerIds = [...new Set(withdrawals?.map(w => w.seller_id) || [])];
      const { data: sellers, error: sellersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', sellerIds);

      if (sellersError) throw sellersError;

      // Combinar dados dos withdrawals com dados dos vendedores
      const sellersMap = new Map(sellers?.map(seller => [seller.id, seller]) || []);

      const formattedRequests = withdrawals?.map((request: any) => {
        const seller = sellersMap.get(request.seller_id);
        return {
          id: request.id,
          seller_id: request.seller_id,
          amount: request.amount,
          status: request.status,
          requested_at: request.requested_at,
          reviewed_at: request.reviewed_at,
          reviewed_by: request.reviewed_by,
          admin_notes: request.admin_notes,
          processed_at: request.processed_at,
          seller_name: seller?.name || 'Nome não disponível',
          seller_email: seller?.email || 'Email não disponível',
          chave_pix: 'Chave PIX será exibida após migração',
        };
      }) || [];

      setRequests(formattedRequests);

      // Calcular estatísticas
      const pending = formattedRequests.filter(r => r.status === 'pending').length;
      const approved = formattedRequests.filter(r => r.status === 'approved').length;
      const totalAmount = formattedRequests
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + r.amount, 0);

      setStats({
        totalPending: pending,
        totalApproved: approved,
        totalAmount,
      });

    } catch (error: any) {
      console.error('Erro ao buscar solicitações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível carregar as solicitações de saque."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      // Buscar dados do usuário admin atual
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: reviewAction === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
          admin_notes: adminNotes || null,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: reviewAction === 'approve' ? "Solicitação aprovada" : "Solicitação rejeitada",
        description: `A solicitação de ${formatCurrency(selectedRequest.amount)} foi ${reviewAction === 'approve' ? 'aprovada' : 'rejeitada'}.`
      });

      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      await fetchWithdrawalRequests();

    } catch (error: any) {
      console.error('Erro ao revisar solicitação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível processar a revisão."
      });
    } finally {
      setProcessing(false);
    }
  };

  const openReviewModal = (request: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setAdminNotes(request.admin_notes || "");
    setIsReviewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, color: "text-yellow-400 border-yellow-400", label: "Pendente", icon: Clock },
      approved: { variant: "outline" as const, color: "text-green-400 border-green-400", label: "Aprovado", icon: CheckCircle },
      rejected: { variant: "outline" as const, color: "text-red-400 border-red-400", label: "Rejeitado", icon: XCircle },
      processed: { variant: "outline" as const, color: "text-blue-400 border-blue-400", label: "Processado", icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.color} bg-transparent`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
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

  if (loading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-tech-light text-sm font-medium">Solicitações Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.totalPending}</p>
                <p className="text-tech-light text-xs">Aguardando análise</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-tech-light text-sm font-medium">Solicitações Aprovadas</p>
                <p className="text-2xl font-bold text-green-400">{stats.totalApproved}</p>
                <p className="text-tech-light text-xs">Aprovadas para pagamento</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-tech-secondary border-tech-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-tech-light text-sm font-medium">Valor Total Pendente</p>
                <p className="text-2xl font-bold text-tech-highlight">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-tech-light text-xs">A ser processado</p>
              </div>
              <div className="p-3 rounded-full bg-tech-highlight/10">
                <DollarSign className="h-6 w-6 text-tech-highlight" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Solicitações */}
      <Card className="bg-tech-secondary border-tech-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Solicitações de Saque
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center text-tech-light py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhuma solicitação encontrada</p>
              <p className="text-sm">As solicitações de saque aparecerão aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-tech-border">
                    <TableHead className="text-tech-light">Vendedor</TableHead>
                    <TableHead className="text-tech-light">Email</TableHead>
                    <TableHead className="text-tech-light">Valor</TableHead>
                    <TableHead className="text-tech-light">Data Solicitação</TableHead>
                    <TableHead className="text-tech-light">Status</TableHead>
                    <TableHead className="text-tech-light">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="border-tech-border">
                      <TableCell className="text-white font-medium">
                        {request.seller_name}
                      </TableCell>
                      <TableCell className="text-tech-light">
                        {request.seller_email}
                      </TableCell>
                      <TableCell className="text-tech-highlight font-medium">
                        {formatCurrency(request.amount)}
                      </TableCell>
                      <TableCell className="text-tech-light">
                        {formatDate(request.requested_at)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => openReviewModal(request, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReviewModal(request, 'reject')}
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          {request.status !== 'pending' && request.reviewed_at && (
                            <span className="text-tech-light text-sm">
                              {request.status === 'approved' ? 'Aprovado' : 'Rejeitado'} em {formatDate(request.reviewed_at)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Revisão */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="bg-tech-secondary border-tech-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              {reviewAction === 'approve' ? 'Aprovar' : 'Rejeitar'} Solicitação
            </DialogTitle>
            <DialogDescription className="text-tech-light">
              {reviewAction === 'approve' 
                ? 'Confirme a aprovação desta solicitação de saque.'
                : 'Informe o motivo da rejeição desta solicitação.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-tech-darker rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-tech-light">Vendedor:</span>
                    <p className="text-white font-medium">{selectedRequest.seller_name}</p>
                  </div>
                  <div>
                    <span className="text-tech-light">Valor:</span>
                    <p className="text-tech-highlight font-medium">{formatCurrency(selectedRequest.amount)}</p>
                  </div>
                  <div>
                    <span className="text-tech-light">Email:</span>
                    <p className="text-white">{selectedRequest.seller_email}</p>
                  </div>
                  <div>
                    <span className="text-tech-light">Data:</span>
                    <p className="text-white">{formatDate(selectedRequest.requested_at)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-tech-light">Chave PIX:</span>
                    <p className="text-tech-highlight font-mono bg-tech-secondary p-2 rounded border mt-1">
                      {selectedRequest.chave_pix || 'Chave PIX não encontrada'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="admin-notes" className="text-tech-light">
                  {reviewAction === 'approve' ? 'Observações (opcional)' : 'Motivo da rejeição'}
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={reviewAction === 'approve' 
                    ? 'Adicione observações sobre a aprovação...'
                    : 'Explique o motivo da rejeição...'}
                  className="bg-tech-darker border-tech-border text-white mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsReviewModalOpen(false)}
              className="border-tech-border text-tech-light hover:bg-tech-darker"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReviewRequest} 
              disabled={processing || (reviewAction === 'reject' && !adminNotes.trim())}
              className={reviewAction === 'approve' 
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"}
            >
              {processing ? "Processando..." : reviewAction === 'approve' ? "Aprovar" : "Rejeitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalRequestsManager;