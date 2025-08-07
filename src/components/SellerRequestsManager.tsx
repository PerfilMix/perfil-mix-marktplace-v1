import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Image,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface SellerRequest {
  id: string;
  user_id: string;
  nome_completo?: string;
  cpf_cnpj?: string;
  telefone?: string;
  endereco_completo?: string;
  chave_pix?: string;
  documento_foto_url?: string;
  selfie_documento_url?: string;
  termos_aceitos?: boolean;
  data_envio_documentos?: string;
  admin_observacoes?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  users?: {
    name: string;
    email: string;
  };
}

export const SellerRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SellerRequest | null>(null);
  const [adminObservations, setAdminObservations] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [documentUrls, setDocumentUrls] = useState<Record<string, { documento?: string; selfie?: string }>>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  // Função para obter URL assinada do documento
  const getSignedUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('seller-documents')
        .createSignedUrl(filePath, 3600); // 1 hora de validade

      if (error) {
        console.error('Erro ao gerar URL assinada:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      return null;
    }
  };

  // Função para extrair o caminho do arquivo da URL
  const extractFilePath = (fullUrl: string): string | null => {
    try {
      const url = new URL(fullUrl);
      const pathParts = url.pathname.split('/');
      const objectIndex = pathParts.findIndex(part => part === 'object');
      if (objectIndex !== -1 && pathParts[objectIndex + 1] === 'public') {
        // Remove /storage/v1/object/public/seller-documents/ para obter o caminho do arquivo
        return pathParts.slice(objectIndex + 3).join('/');
      }
      return null;
    } catch {
      return null;
    }
  };

  // Carregar URLs assinadas para os documentos
  const loadDocumentUrls = async (requests: SellerRequest[]) => {
    const urls: Record<string, { documento?: string; selfie?: string }> = {};
    
    for (const request of requests) {
      const requestUrls: { documento?: string; selfie?: string } = {};
      
      if (request.documento_foto_url) {
        const filePath = extractFilePath(request.documento_foto_url);
        if (filePath) {
          const signedUrl = await getSignedUrl(filePath);
          if (signedUrl) {
            requestUrls.documento = signedUrl;
          }
        }
      }
      
      if (request.selfie_documento_url) {
        const filePath = extractFilePath(request.selfie_documento_url);
        if (filePath) {
          const signedUrl = await getSignedUrl(filePath);
          if (signedUrl) {
            requestUrls.selfie = signedUrl;
          }
        }
      }
      
      if (requestUrls.documento || requestUrls.selfie) {
        urls[request.id] = requestUrls;
      }
    }
    
    setDocumentUrls(urls);
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Buscar dados dos usuários separadamente
      const userIds = data?.map(request => request.user_id).filter(Boolean) || [];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);

      // Combinar os dados
      const typedData = (data || []).map(item => {
        const userData = usersData?.find(user => user.id === item.user_id);
        return {
          ...item,
          status: item.status as 'pending' | 'approved' | 'rejected',
          users: userData ? { name: userData.name, email: userData.email } : { name: '', email: '' }
        };
      }) as SellerRequest[];
      
      setRequests(typedData);
      
      // Carregar URLs assinadas dos documentos
      loadDocumentUrls(typedData);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações de vendedores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      setProcessingId(requestId);

      // Atualizar solicitação
      const { error: requestError } = await supabase
        .from('seller_requests')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          admin_observacoes: adminObservations || null
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Se aprovado, atualizar usuário para vendedor
      if (action === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: userError } = await supabase
            .from('users')
            .update({ is_approved_seller: true })
            .eq('id', request.user_id);

          if (userError) throw userError;
        }
      }

      toast({
        title: "Sucesso",
        description: `Solicitação ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`,
      });

      fetchRequests();
      setSelectedRequest(null);
      setAdminObservations('');

    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar solicitação.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Função para reabrir solicitação para nova avaliação
  const handleReevaluateRequest = async (requestId: string) => {
    try {
      setProcessingId(requestId);

      // Resetar status para pendente e limpar observações administrativas
      const { error } = await supabase
        .from('seller_requests')
        .update({
          status: 'pending',
          reviewed_at: null,
          admin_observacoes: null
        })
        .eq('id', requestId);

      if (error) throw error;

      // Se a solicitação estava aprovada, remover status de vendedor do usuário
      const request = requests.find(r => r.id === requestId);
      if (request && request.status === 'approved') {
        const { error: userError } = await supabase
          .from('users')
          .update({ is_approved_seller: false })
          .eq('id', request.user_id);

        if (userError) throw userError;
      }

      toast({
        title: "Sucesso",
        description: "Solicitação reaberta para nova avaliação!",
      });

      fetchRequests();
      setSelectedRequest(null);
      setAdminObservations('');

    } catch (error) {
      console.error('Erro ao reavaliar solicitação:', error);
      toast({
        title: "Erro",
        description: "Erro ao reabrir solicitação para avaliação.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">Aprovada</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-400/30">Rejeitada</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Pendente</Badge>;
    }
  };

  const RequestDetailsModal = ({ request }: { request: SellerRequest }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Detalhes da Solicitação - {request.nome_completo || request.users?.name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Status e Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data da Solicitação</p>
                <p className="mt-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {request.data_envio_documentos && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Envio dos Documentos</p>
                <p className="mt-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(request.data_envio_documentos).toLocaleDateString('pt-BR')} às {new Date(request.data_envio_documentos).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                <p className="mt-1 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {request.nome_completo || 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                <p className="mt-1 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {request.users?.email || 'Não disponível'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ</p>
                <p className="mt-1 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {request.cpf_cnpj || 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p className="mt-1 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {request.telefone || 'Não informado'}
                </p>
              </div>
            </div>

            {request.chave_pix && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chave PIX</p>
                <p className="mt-1 flex items-center gap-1 bg-muted/50 p-2 rounded-md border">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm text-foreground">{request.chave_pix}</span>
                </p>
              </div>
            )}

            {request.endereco_completo && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Endereço Completo</p>
                <p className="mt-1 flex items-start gap-1">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  {request.endereco_completo}
                </p>
              </div>
            )}

            {request.message && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mensagem do Solicitante</p>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  {request.message}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Termos Aceitos:</p>
              {request.termos_aceitos ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">Sim</Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-400/30">Não</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documentos de Verificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Documento de Identificação */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Documento de Identificação
                </h4>
                {documentUrls[request.id]?.documento ? (
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={documentUrls[request.id].documento}
                      alt="Documento de Identificação"
                      className="w-full h-48 object-contain bg-gray-50"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem do documento');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="p-2 bg-gray-50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(documentUrls[request.id].documento, '_blank')}
                        className="w-full"
                      >
                        Ver em Tamanho Original
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Documento não enviado</p>
                  </div>
                )}
              </div>

              {/* Selfie com Documento */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Selfie com Documento
                </h4>
                {documentUrls[request.id]?.selfie ? (
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={documentUrls[request.id].selfie}
                      alt="Selfie com Documento"
                      className="w-full h-48 object-contain bg-gray-50"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem da selfie');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="p-2 bg-gray-50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(documentUrls[request.id].selfie, '_blank')}
                        className="w-full"
                      >
                        Ver em Tamanho Original
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Selfie não enviada</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações Administrativas */}
        {request.status === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações Administrativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Adicionar observações (opcional)
                </label>
                <Textarea
                  value={adminObservations}
                  onChange={(e) => setAdminObservations(e.target.value)}
                  placeholder="Digite observações sobre esta solicitação..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleReviewRequest(request.id, 'approved')}
                  disabled={processingId === request.id}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processingId === request.id ? 'Processando...' : 'Aprovar Solicitação'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewRequest(request.id, 'rejected')}
                  disabled={processingId === request.id}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {processingId === request.id ? 'Processando...' : 'Rejeitar Solicitação'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão para Reavaliar Solicitações Processadas */}
        {request.status !== 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reavaliar Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta solicitação já foi processada. Clique no botão abaixo para reabrir para nova avaliação.
              </p>
              <Button
                variant="outline"
                onClick={() => handleReevaluateRequest(request.id)}
                disabled={processingId === request.id}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {processingId === request.id ? 'Reabrindo...' : 'Avaliar Novamente'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Observações Existentes */}
        {request.admin_observacoes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações do Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-muted p-3 rounded-lg">
                {request.admin_observacoes}
              </p>
              {request.reviewed_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Revisado em: {new Date(request.reviewed_at).toLocaleDateString('pt-BR')} às {new Date(request.reviewed_at).toLocaleTimeString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DialogContent>
  );

  if (loading) {
    return <div className="p-6 text-center">Carregando solicitações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Solicitações de Vendedores</h2>
          <p className="text-muted-foreground">
            Gerencie as solicitações para se tornar vendedor na plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-400/30">
            Pendentes: {requests.filter(r => r.status === 'pending').length}
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-400/30">
            Aprovadas: {requests.filter(r => r.status === 'approved').length}
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-400/30">
            Rejeitadas: {requests.filter(r => r.status === 'rejected').length}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma solicitação encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {request.nome_completo || request.users?.name || 'Nome não informado'}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {request.users?.email || 'E-mail não disponível'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {request.telefone || 'Telefone não informado'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Docs: {(request.documento_foto_url && request.selfie_documento_url) ? 'Completos' : 'Incompletos'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      {selectedRequest && (
                        <RequestDetailsModal request={selectedRequest} />
                      )}
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};