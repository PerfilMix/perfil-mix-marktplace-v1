
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, UserPlus, ArrowRightLeft, Eye, EyeOff } from "lucide-react";
import { formatNumberWithK } from "@/lib/helpers";

interface User {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string;
  created_at: string;
  is_admin: boolean;
  accounts_count?: number;
}

interface Account {
  id: string;
  nome: string;
  seguidores: number;
  nicho: string;
  preco: number;
  pais: string;
  status: string;
  comprada_por?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedTargetUser, setSelectedTargetUser] = useState("");
  const [selectedAccountToLink, setSelectedAccountToLink] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchAccounts();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Buscar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          profile_image_url,
          created_at,
          is_admin
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Buscar emails dos administradores para filtrar
      const { data: adminsData, error: adminsError } = await supabase
        .from('admins')
        .select('email');

      if (adminsError) throw adminsError;

      const adminEmails = new Set(adminsData?.map(admin => admin.email) || []);

      // Filtrar usuários: excluir aqueles que são APENAS administradores
      // (ou seja, estão na tabela admins mas não são usuários "reais" do sistema)
      const filteredUsers = (usersData || []).filter(user => {
        // Se o usuário está na tabela admins, verificar se também tem características de usuário real
        if (adminEmails.has(user.email)) {
          // Considerar usuário real se:
          // 1. Não é marcado como admin na tabela users, OU
          // 2. Tem perfil completo (nome não é só "Administrador" ou similar)
          const isRealUser = !user.is_admin || 
                           (user.name && 
                            user.name.toLowerCase() !== 'administrador' && 
                            user.name.toLowerCase() !== 'admin');
          return isRealUser;
        }
        // Se não está na tabela admins, é um usuário normal
        return true;
      });

      // Buscar contagem de contas para cada usuário filtrado
      const usersWithCounts = await Promise.all(
        filteredUsers.map(async (user) => {
          const { count } = await supabase
            .from('accounts')
            .select('*', { count: 'exact', head: true })
            .eq('comprada_por', user.id);
          
          return {
            ...user,
            accounts_count: count || 0
          };
        })
      );

      setUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Account interface (without moeda)
      const transformedAccounts = (data || []).map(account => ({
        id: account.id,
        nome: account.nome,
        seguidores: account.seguidores,
        nicho: account.nicho,
        preco: account.preco,
        pais: account.pais,
        status: account.status,
        comprada_por: account.comprada_por
      }));

      setAccounts(transformedAccounts);
      setAvailableAccounts(transformedAccounts.filter(acc => !acc.comprada_por));
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchUserAccounts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('comprada_por', userId);

      if (error) throw error;

      // Transform the data to match our Account interface (without moeda)
      const transformedAccounts = (data || []).map(account => ({
        id: account.id,
        nome: account.nome,
        seguidores: account.seguidores,
        nicho: account.nicho,
        preco: account.preco,
        pais: account.pais,
        status: account.status,
        comprada_por: account.comprada_por
      }));

      setUserAccounts(transformedAccounts);
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      setUserAccounts([]);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setNewPassword("");
    fetchUserAccounts(user.id);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const updateData: any = {
        name: editName,
        email: editEmail,
      };

      if (newPassword.trim()) {
        updateData.password = newPassword;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });

      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!selectedUser || !selectedAccountToLink) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          comprada_por: selectedUser.id,
          status: 'vendido'
        })
        .eq('id', selectedAccountToLink);

      if (error) throw error;

      toast({
        title: "Conta vinculada",
        description: `Conta vinculada ao usuário ${selectedUser.name} com sucesso.`,
      });

      fetchAccounts();
      fetchUserAccounts(selectedUser.id);
      fetchUsers();
      setSelectedAccountToLink("");
    } catch (error) {
      console.error('Error linking account:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível vincular a conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferAccount = (account: Account) => {
    setSelectedAccount(account);
    setSelectedTargetUser("");
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedAccount || !selectedTargetUser) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          comprada_por: selectedTargetUser
        })
        .eq('id', selectedAccount.id);

      if (error) throw error;

      const targetUser = users.find(u => u.id === selectedTargetUser);
      
      toast({
        title: "Conta transferida",
        description: `Conta ${selectedAccount.nome} transferida para ${targetUser?.name} com sucesso.`,
      });

      setIsTransferModalOpen(false);
      fetchAccounts();
      if (selectedUser) {
        fetchUserAccounts(selectedUser.id);
      }
      fetchUsers();
    } catch (error) {
      console.error('Error transferring account:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível transferir a conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Controle de Usuários</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Card className="glass-card" style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader style={{ backgroundColor: '#1D1D1D' }}>
                <TableRow style={{ backgroundColor: '#1D1D1D' }}>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contas</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-[#1D1D1D] transition-colors duration-200">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile_image_url} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.is_admin ? "bg-purple-600" : "bg-gray-600"}>
                          {user.is_admin ? "Admin" : "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.accounts_count} conta{user.accounts_count !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Gerenciar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <p className="text-gray-400">Nenhum usuário encontrado.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Usuário */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuário: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Edite as informações do usuário e gerencie suas contas.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="accounts">Contas ({userAccounts.length})</TabsTrigger>
              <TabsTrigger value="link">Vincular Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="new-password">Nova Senha (deixe vazio para não alterar)</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha..."
                      className="pr-10"
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
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Contas do Usuário</h4>
                {userAccounts.length > 0 ? (
                  <div className="space-y-2">
                     {userAccounts.map((account) => (
                       <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-[#1D1D1D] transition-colors duration-200">
                        <div>
                          <span className="font-medium">{account.nome}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatNumberWithK(account.seguidores)} seguidores • {account.nicho}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTransferAccount(account)}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-1" />
                          Transferir
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Este usuário não possui contas.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Vincular Conta Disponível</h4>
                <div className="space-y-2">
                  <Label>Selecionar Conta</Label>
                  <Select value={selectedAccountToLink} onValueChange={setSelectedAccountToLink}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma conta disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.nome} - {formatNumberWithK(account.seguidores)} seguidores ({account.nicho})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleLinkAccount}
                  disabled={!selectedAccountToLink || isLoading}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Vincular Conta ao Usuário
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={isLoading}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Transferência de Conta */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Transferir Conta</DialogTitle>
            <DialogDescription>
              Transferir a conta "{selectedAccount?.nome}" para outro usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usuário Destino</Label>
              <Select value={selectedTargetUser} onValueChange={setSelectedTargetUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário destino" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(user => user.id !== selectedUser?.id)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmTransfer}
              disabled={!selectedTargetUser || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Confirmar Transferência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
