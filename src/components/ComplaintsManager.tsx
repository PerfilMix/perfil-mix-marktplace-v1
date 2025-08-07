import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MessageSquare, Eye, Calendar, Image as ImageIcon, Phone, ZoomIn, Archive, Filter, Search, ArchiveX } from "lucide-react";
import { Complaint } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageViewer from "./ImageViewer";

const ComplaintsManager = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      // Buscar reclamações reais do Supabase
      const { data: complaintsData, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Tabela complaints ainda não existe ou está vazia');
        setComplaints([]);
        setIsLoading(false);
        return;
      }

      // Processar dados reais quando existirem
      const complaintsList: Complaint[] = [];
      for (const complaint of complaintsData || []) {
        // Buscar dados da conta
        const { data: accountData } = await supabase
          .from('accounts')
          .select('nome, login, senha')
          .eq('id', complaint.conta_id)
          .single();

        // Buscar dados do usuário
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', complaint.usuario_id)
          .single();

        // Buscar dados do vendedor se existir
        let vendedorData = null;
        let vendedorUserData = null;
        if (complaint.vendedor_id) {
          // Buscar dados do seller_requests
          const { data: sellerData } = await supabase
            .from('seller_requests')
            .select('nome_completo, telefone')
            .eq('user_id', complaint.vendedor_id)
            .single();
          
          // Buscar dados do user (email)
          const { data: userData } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', complaint.vendedor_id)
            .single();
            
          vendedorData = sellerData;
          vendedorUserData = userData;
        }

        // Buscar data da compra da transação
        const { data: transactionData } = await supabase
          .from('transactions')
          .select('created_at')
          .eq('account_id', complaint.conta_id)
          .eq('user_id', complaint.usuario_id)
          .eq('status', 'completed')
          .single();

        complaintsList.push({
          id: complaint.id,
          usuario_id: complaint.usuario_id,
          conta_id: complaint.conta_id,
          vendedor_id: complaint.vendedor_id,
          texto: complaint.texto,
          imagem_url: complaint.imagem_url,
          usuario_telefone: complaint.usuario_telefone,
          vendedor_telefone: complaint.vendedor_telefone,
          status: complaint.status as 'pendente' | 'em_analise' | 'resolvida' | 'rejeitada',
          arquivada: complaint.arquivada || false,
          created_at: complaint.created_at,
          updated_at: complaint.updated_at,
          data_compra: transactionData?.created_at,
          usuario_nome: 'Usuário',
          usuario_email: userData?.email || 'Email não encontrado',
          conta_nome: accountData?.nome || 'Conta não encontrada',
          conta_login: accountData?.login,
          conta_senha: accountData?.senha,
          vendedor_nome: vendedorData?.nome_completo || vendedorUserData?.name,
          vendedor_email: vendedorUserData?.email
        });
      }

      setComplaints(complaintsList);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaintId);

      if (error) throw error;

      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, status: newStatus as any }
            : complaint
        )
      );
      toast({ title: "Status atualizado", description: "Status da reclamação foi atualizado." });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao atualizar o status da reclamação.",
        variant: "destructive"
      });
    }
  };

  const archiveComplaint = async (complaintId: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    
    if (complaint?.status !== 'resolvida') {
      toast({
        title: "Operação não permitida",
        description: "Apenas reclamações resolvidas podem ser arquivadas.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('complaints')
        .update({ arquivada: true })
        .eq('id', complaintId);

      if (error) throw error;

      setComplaints(prev => 
        prev.map(c => 
          c.id === complaintId 
            ? { ...c, arquivada: true }
            : c
        )
      );
      toast({ title: "Reclamação arquivada", description: "A reclamação foi movida para o arquivo." });
    } catch (error) {
      console.error('Error archiving complaint:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao arquivar a reclamação.",
        variant: "destructive"
      });
    }
  };

  const unarchiveComplaint = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ arquivada: false })
        .eq('id', complaintId);

      if (error) throw error;

      setComplaints(prev => 
        prev.map(c => 
          c.id === complaintId 
            ? { ...c, arquivada: false }
            : c
        )
      );
      toast({ title: "Reclamação desarquivada", description: "A reclamação foi restaurada para a lista ativa." });
    } catch (error) {
      console.error('Error unarchiving complaint:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao desarquivar a reclamação.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-500',
      'em_analise': 'bg-blue-500', 
      'resolvida': 'bg-green-500',
      'rejeitada': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'resolvida': 'Resolvida', 
      'rejeitada': 'Rejeitada'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Função para filtrar reclamações
  const filterComplaints = (complaintsToFilter: Complaint[]) => {
    return complaintsToFilter.filter(complaint => {
      const matchesSearch = 
        complaint.usuario_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.conta_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.vendedor_nome?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  // Separar reclamações ativas e arquivadas
  const activeComplaints = filterComplaints(complaints.filter(c => !c.arquivada));
  const archivedComplaints = filterComplaints(complaints.filter(c => c.arquivada));

  const renderComplaintCard = (complaint: Complaint) => (
    <div key={complaint.id} className="bg-tech-darker/50 rounded-lg p-4 border border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getStatusColor(complaint.status)} text-white border-0`}>
              {getStatusText(complaint.status)}
            </Badge>
            {complaint.arquivada && (
              <Badge className="bg-gray-600 text-white border-0">
                Arquivada
              </Badge>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Reclamação: {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
              </span>
              {complaint.data_compra && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Compra: {new Date(complaint.data_compra).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Usuário:</p>
              <p className="text-white">{complaint.usuario_nome}</p>
              <p className="text-gray-300 text-xs">{complaint.usuario_email}</p>
              {complaint.usuario_telefone && (
                <p className="text-gray-300 text-xs flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {complaint.usuario_telefone}
                </p>
              )}
            </div>
            
            <div>
              <p className="text-gray-400">Conta:</p>
              <p className="text-white">{complaint.conta_nome}</p>
              {complaint.vendedor_nome && (
                <p className="text-gray-300 text-xs">Vendedor: {complaint.vendedor_nome}</p>
              )}
              {complaint.vendedor_telefone && (
                <p className="text-gray-300 text-xs flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {complaint.vendedor_telefone}
                </p>
              )}
            </div>
          </div>
          
          {complaint.imagem_url && (
            <div className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Print anexado</span>
            </div>
          )}
          
          <div>
            <p className="text-gray-400 text-sm">Problema relatado:</p>
            <p className="text-white text-sm bg-black/20 rounded p-2 mt-1">
              {complaint.texto}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedComplaint(complaint)}
                className="border-tech-accent text-white hover:bg-tech-accent/20"
              >
                <Eye className="h-4 w-4 mr-1" />
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-tech-darker border-tech-accent/20">
              <DialogHeader>
                <DialogTitle className="text-white">Detalhes da Reclamação</DialogTitle>
              </DialogHeader>
              
              {selectedComplaint && (
                <div className="space-y-4">
                  {/* Informações de datas */}
                  <div className="bg-black/20 rounded p-3 space-y-2">
                    <p className="text-gray-400 text-sm font-medium">Informações de Data</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-300">
                          Reclamação: {new Date(selectedComplaint.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {selectedComplaint.data_compra && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-400" />
                          <span className="text-green-300">
                            Compra: {new Date(selectedComplaint.data_compra).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Exibir imagem anexada se existir */}
                  {selectedComplaint.imagem_url && (
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Print anexado:</p>
                      <div className="relative">
                        <img 
                          src={selectedComplaint.imagem_url} 
                          alt="Print da reclamação"
                          className="max-w-full h-48 object-contain rounded border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setSelectedImage(selectedComplaint.imagem_url!);
                            setIsImageViewerOpen(true);
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                          <ZoomIn className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Dados do Usuário</p>
                        <div className="bg-black/20 rounded p-2 text-sm space-y-1">
                          <p className="text-blue-300">Nome: {selectedComplaint.usuario_nome}</p>
                          <p className="text-blue-300">Email: {selectedComplaint.usuario_email}</p>
                          {selectedComplaint.usuario_telefone && (
                            <p className="text-blue-300 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedComplaint.usuario_telefone}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Credenciais da Conta</p>
                        <div className="bg-black/20 rounded p-2 text-sm">
                          <p className="text-green-300">Conta: {selectedComplaint.conta_nome}</p>
                          <p className="text-green-300">Login: {selectedComplaint.conta_login}</p>
                          <p className="text-green-300">Senha: {selectedComplaint.conta_senha}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedComplaint.vendedor_nome && (
                        <div>
                          <p className="text-gray-400 text-sm">Dados do Vendedor</p>
                          <div className="bg-black/20 rounded p-2 text-sm space-y-1">
                            <p className="text-orange-300">Nome: {selectedComplaint.vendedor_nome}</p>
                            {selectedComplaint.vendedor_email && (
                              <p className="text-orange-300">Email: {selectedComplaint.vendedor_email}</p>
                            )}
                            {selectedComplaint.vendedor_telefone && (
                              <p className="text-orange-300 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {selectedComplaint.vendedor_telefone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-gray-400 text-sm">Status Atual</p>
                        <Select 
                          value={selectedComplaint.status} 
                          onValueChange={(value) => updateComplaintStatus(selectedComplaint.id, value)}
                        >
                          <SelectTrigger className="bg-black/20 border-white/10 text-white w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-tech-darker border-tech-accent/20">
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_analise">Em Análise</SelectItem>
                            <SelectItem value="resolvida">Resolvida</SelectItem>
                            <SelectItem value="rejeitada">Rejeitada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Botões de arquivamento */}
                      <div className="space-y-2">
                        {!selectedComplaint.arquivada ? (
                          <Button
                            onClick={() => archiveComplaint(selectedComplaint.id)}
                            disabled={selectedComplaint.status !== 'resolvida'}
                            className="w-full bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                            size="sm"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Arquivar
                          </Button>
                        ) : (
                          <Button
                            onClick={() => unarchiveComplaint(selectedComplaint.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <ArchiveX className="h-4 w-4 mr-2" />
                            Desarquivar
                          </Button>
                        )}
                        {selectedComplaint.status !== 'resolvida' && !selectedComplaint.arquivada && (
                          <p className="text-xs text-gray-400">
                            * Apenas reclamações resolvidas podem ser arquivadas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Descrição completa do problema:</p>
                    <div className="bg-black/20 rounded p-3 text-white text-sm mt-1">
                      {selectedComplaint.texto}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Botão de arquivamento rápido */}
          {!complaint.arquivada ? (
            <Button
              onClick={() => archiveComplaint(complaint.id)}
              disabled={complaint.status !== 'resolvida'}
              variant="outline"
              size="sm"
              className="border-gray-500 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => unarchiveComplaint(complaint.id)}
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-300 hover:bg-blue-700"
            >
              <ArchiveX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="glass-card border-tech-accent/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reclamações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Carregando reclamações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-tech-accent/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Gerenciar Reclamações
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por email, conta, problema ou vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-tech-darker border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-tech-darker border-white/10 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-tech-darker border-tech-accent/20">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="resolvida">Resolvida</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Abas para reclamações ativas e arquivadas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-tech-darker">
            <TabsTrigger value="active" className="data-[state=active]:bg-tech-accent">
              Ativas ({activeComplaints.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-tech-accent">
              Arquivadas ({archivedComplaints.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4 mt-4">
            {activeComplaints.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {searchTerm || statusFilter !== "all" 
                  ? "Nenhuma reclamação ativa encontrada com os filtros aplicados"
                  : "Nenhuma reclamação ativa registrada"
                }
              </p>
            ) : (
              <div className="space-y-4">
                {activeComplaints.map(renderComplaintCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="archived" className="space-y-4 mt-4">
            {archivedComplaints.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {searchTerm || statusFilter !== "all" 
                  ? "Nenhuma reclamação arquivada encontrada com os filtros aplicados"
                  : "Nenhuma reclamação arquivada"
                }
              </p>
            ) : (
              <div className="space-y-4">
                {archivedComplaints.map(renderComplaintCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Visualizador de Imagem Avançado */}
      <ImageViewer
        imageUrl={selectedImage}
        isOpen={isImageViewerOpen}
        onClose={() => {
          setIsImageViewerOpen(false);
          setSelectedImage(null);
        }}
        title="Print da Reclamação"
      />
    </Card>
  );
};

export default ComplaintsManager;