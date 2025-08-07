import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { formatPhoneDisplay } from "@/lib/phoneFormat";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface FormData {
  nomeCompleto: string;
  telefone: string;
  email: string;
  senha: string;
  tipoUsuario: string;
  permissions: string[];
}

const availablePermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "add", label: "Adicionar Conta" },
  { id: "manage", label: "Gerenciar Contas" },
  { id: "complaints", label: "Reclamações" },
  { id: "seller-requests", label: "Solicitações de Vendas" },
  { id: "seller-control", label: "Controle de Vendedores" },
  { id: "users", label: "Controle de Usuários" },
  { id: "personalize", label: "Personalização" }
];

export default function ManualUserRegistration() {
  const { toast } = useToast();
  const { isAuthenticated } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    telefone: "",
    email: "",
    senha: "",
    tipoUsuario: "",
    permissions: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nomeCompleto || !formData.email || !formData.senha || !formData.tipoUsuario) {
        toast({
          title: "Erro",
          description: "Todos os campos obrigatórios devem ser preenchidos",
          variant: "destructive"
        });
        return;
      }

      if (formData.tipoUsuario === "colaborador" && formData.permissions.length === 0) {
        toast({
          title: "Erro", 
          description: "Selecione pelo menos uma permissão para colaboradores",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o admin está autenticado
      if (!isAuthenticated) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Usar o sistema de autenticação do Supabase para criar o usuário
      console.log('Criando usuário via Supabase Auth para:', formData.email);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.senha,
        options: {
          data: {
            name: formData.nomeCompleto.trim(),
            telefone: formData.telefone.trim()
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        console.error('Erro na autenticação:', authError);
        if (authError.message.includes('User already registered')) {
          toast({
            title: "Erro",
            description: "Este email já está em uso. Por favor, use outro email.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: authError.message || "Erro ao criar conta de usuário",
            variant: "destructive"
          });
        }
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erro",
          description: "Erro ao criar usuário no sistema de autenticação",
          variant: "destructive"
        });
        return;
      }

      console.log('Usuário criado via auth:', authData.user.id);

      // Aguardar um pouco para garantir que o trigger handle_new_user seja executado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Agora atualizar os dados específicos do tipo de usuário
      if (formData.tipoUsuario === "admin") {
        // Atualizar na tabela users para ser admin
        const { error: updateError } = await supabase
          .from("users")
          .update({ is_admin: true })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar usuário para admin:', updateError);
          throw updateError;
        }

        // Cadastrar também na tabela admins
        const { error: adminError } = await supabase
          .from("admins")
          .insert({
            id: authData.user.id,
            email: formData.email,
            password: formData.senha
          });

        if (adminError) {
          console.error('Erro ao inserir admin:', adminError);
          // Não falha aqui pois o usuário já foi criado
        }

        toast({
          title: "Sucesso",
          description: "Administrador cadastrado com sucesso. O usuário deve confirmar o email para fazer login.",
        });
      } else if (formData.tipoUsuario === "colaborador") {
        // Cadastrar como colaborador
        const { error: collabError } = await supabase
          .from("collaborators")
          .insert({
            id: authData.user.id,
            email: formData.email,
            password: formData.senha,
            name: formData.nomeCompleto,
            telefone: formData.telefone,
            permissions: formData.permissions,
            created_by: null // Admin criado via sistema admin
          });

        if (collabError) {
          console.error('Erro ao inserir colaborador:', collabError);
          throw collabError;
        }

        toast({
          title: "Sucesso", 
          description: "Colaborador cadastrado com sucesso. O usuário deve confirmar o email para fazer login.",
        });
      } else if (formData.tipoUsuario === "usuario") {
        // Para usuário comum, os dados já foram inseridos pelo trigger handle_new_user
        toast({
          title: "Sucesso",
          description: "Usuário cadastrado com sucesso. O usuário deve confirmar o email para fazer login.",
        });
      }

      // Limpar formulário
      setFormData({
        nomeCompleto: "",
        telefone: "",
        email: "",
        senha: "",
        tipoUsuario: "",
        permissions: []
      });

    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  return (
    <Card className="glass-card border-tech-accent/20 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Cadastro Manual de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeCompleto" className="text-gray-300">
                Nome Completo *
              </Label>
              <Input
                id="nomeCompleto"
                type="text"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                className="bg-tech-darker border-tech-accent/30 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone" className="text-gray-300">
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => {
                  const formatted = formatPhoneDisplay(e.target.value);
                  setFormData(prev => ({ ...prev, telefone: formatted }));
                }}
                className="bg-tech-darker border-tech-accent/30 text-white"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-300">
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-tech-darker border-tech-accent/30 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="senha" className="text-gray-300">
              Senha *
            </Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                className="bg-tech-darker border-tech-accent/30 text-white pr-10"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
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

          <div>
            <Label htmlFor="tipoUsuario" className="text-gray-300">
              Tipo de Usuário *
            </Label>
            <Select 
              value={formData.tipoUsuario} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipoUsuario: value, permissions: [] }))}
            >
              <SelectTrigger className="bg-tech-darker border-tech-accent/30 text-white">
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent className="bg-tech-darker border-tech-accent/30">
                <SelectItem value="admin" className="text-white hover:bg-tech-accent/20">
                  Administrador
                </SelectItem>
                <SelectItem value="colaborador" className="text-white hover:bg-tech-accent/20">
                  Colaborador
                </SelectItem>
                <SelectItem value="usuario" className="text-white hover:bg-tech-accent/20">
                  Usuário
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipoUsuario === "colaborador" && (
            <div>
              <Label className="text-gray-300 block mb-3">
                Permissões do Colaborador *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.id, checked as boolean)
                      }
                      className="border-tech-accent data-[state=checked]:bg-tech-accent"
                    />
                    <Label
                      htmlFor={permission.id}
                      className="text-gray-300 text-sm cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-tech-accent hover:bg-tech-accent/80 text-white"
          >
            {loading ? "Cadastrando..." : "Cadastrar Usuário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}