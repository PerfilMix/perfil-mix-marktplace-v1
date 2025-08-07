import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Shield, Edit, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/helpers";

interface Admin {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os administradores."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSelectedAdmin(null);
  };

  const handleAddAdmin = async () => {
    if (!email || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return;
    }

    // Verificar se o email já existe
    const existingAdmin = admins.find(admin => admin.email === email);
    if (existingAdmin) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe um administrador com este email."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('admins')
        .insert([{ email, password }]);

      if (error) throw error;

      toast({
        title: "Administrador adicionado",
        description: `O administrador ${email} foi adicionado com sucesso.`
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o administrador."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdmin = async () => {
    if (!selectedAdmin || !email || !password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return;
    }

    // Verificar se o email já existe (exceto o próprio admin)
    const existingAdmin = admins.find(admin => admin.email === email && admin.id !== selectedAdmin.id);
    if (existingAdmin) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe um administrador com este email."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('admins')
        .update({ email, password })
        .eq('id', selectedAdmin.id);

      if (error) throw error;

      toast({
        title: "Administrador atualizado",
        description: `O administrador foi atualizado com sucesso.`
      });

      setIsEditModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o administrador."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (admins.length <= 1) {
      toast({
        variant: "destructive",
        title: "Operação não permitida",
        description: "Deve existir pelo menos um administrador no sistema."
      });
      return;
    }

    // Verificar se o usuário está autenticado como admin
    const adminEmail = localStorage.getItem('adminEmail');
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    
    if (adminAuthenticated !== 'true' || !adminEmail) {
      toast({
        variant: "destructive",
        title: "Não autorizado",
        description: "Você precisa estar logado como administrador para realizar esta ação."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verificar se o admin logado ainda existe na base de dados
      const { data: currentAdmin, error: authError } = await supabase
        .from('admins')
        .select('id, email')
        .eq('email', adminEmail)
        .maybeSingle();

      if (authError || !currentAdmin) {
        toast({
          variant: "destructive",
          title: "Sessão inválida",
          description: "Sua sessão de administrador não é válida. Faça login novamente."
        });
        // Limpar localStorage se admin não existe mais
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminAuthenticated');
        return;
      }

      // Agora pode proceder com a exclusão
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      toast({
        title: "Administrador removido",
        description: "O administrador foi removido com sucesso."
      });

      // Atualizar a lista de admins
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o administrador. Verifique suas permissões."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEmail(admin.email);
    setPassword(admin.password);
    setConfirmPassword(admin.password);
    setIsEditModalOpen(true);
  };

  const togglePasswordVisibility = (adminId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Controle de Administradores</h2>
          <p className="text-gray-400">Gerencie os administradores do sistema</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-tech-accent hover:bg-tech-accent/80 text-white"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Administrador
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-tech-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Administradores</CardTitle>
            <Shield className="h-4 w-4 text-tech-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{admins.length}</div>
            <p className="text-xs text-gray-400">Usuários com acesso total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Administradores */}
      <Card className="glass-card border-tech-accent/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Lista de Administradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-accent mx-auto"></div>
              <p className="text-gray-400 mt-2">Carregando administradores...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum administrador encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-tech-accent/20">
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Senha</TableHead>
                    <TableHead className="text-gray-300">Data de Criação</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} className="border-tech-accent/10">
                      <TableCell className="text-white font-medium">{admin.email}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {showPasswords[admin.id] ? admin.password : "•".repeat(admin.password.length)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(admin.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          >
                            {showPasswords[admin.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {formatDate(admin.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-tech-success/20 text-tech-success border-tech-success/30">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(admin)}
                            className="text-tech-accent hover:text-tech-accent/80 hover:bg-tech-accent/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-tech-danger hover:text-tech-danger/80 hover:bg-tech-danger/10"
                                disabled={admins.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card border-tech-accent/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Tem certeza de que deseja remover o administrador "{admin.email}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-tech-darker border-tech-accent/20 text-white hover:bg-tech-accent/10">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  className="bg-tech-danger hover:bg-tech-danger/80 text-white"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Modal Adicionar Administrador */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="glass-card border-tech-accent/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Administrador</DialogTitle>
            <DialogDescription className="text-gray-400">
              Crie um novo administrador para o sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-email" className="text-gray-300">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-tech-darker border-tech-accent/20 text-white"
                placeholder="admin@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="add-password" className="text-gray-300">Senha</Label>
              <Input
                id="add-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-tech-darker border-tech-accent/20 text-white"
                placeholder="Digite a senha"
              />
            </div>
            
            <div>
              <Label htmlFor="add-confirm-password" className="text-gray-300">Confirmar Senha</Label>
              <Input
                id="add-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-tech-darker border-tech-accent/20 text-white"
                placeholder="Confirme a senha"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="bg-tech-darker border-tech-accent/20 text-white hover:bg-tech-accent/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddAdmin}
              disabled={isLoading}
              className="bg-tech-accent hover:bg-tech-accent/80 text-white"
            >
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Administrador */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-card border-tech-accent/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Administrador</DialogTitle>
            <DialogDescription className="text-gray-400">
              Edite as informações do administrador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email" className="text-gray-300">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-tech-darker border-tech-accent/20 text-white"
                placeholder="admin@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-password" className="text-gray-300">Nova Senha</Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-tech-darker border-tech-accent/20 text-white"
                placeholder="Digite a nova senha"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
              className="bg-tech-darker border-tech-accent/20 text-white hover:bg-tech-accent/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditAdmin}
              disabled={isLoading}
              className="bg-tech-accent hover:bg-tech-accent/80 text-white"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;