
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Por favor, preencha o e-mail e a senha.",
        });
        setIsLoading(false);
        return;
      }

      const result = await login(email, password);

      if (result.success) {
        toast({
          description: "Login de administrador realizado com sucesso.",
        });
        
        // Redirecionar para o painel admin
        navigate("/admin");
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: result.error || "Verifique suas credenciais e tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tech-darker p-4">
      <div className="max-w-md w-full">
        <Card className="glass-card bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 shadow-xl shadow-tech-highlight/10">
          <CardHeader className="text-center border-b border-tech-accent/20 pb-6">
            <CardTitle className="text-2xl text-white">Administração</CardTitle>
            <CardDescription className="text-gray-300">
              Acesse o painel de administração do PerfilMix
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-tech-highlight font-medium">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-tech-darker border-tech-accent/30 text-white placeholder:text-gray-400 focus:border-tech-highlight focus:ring-tech-highlight/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-tech-highlight font-medium">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-tech-darker border-tech-accent/30 text-white placeholder:text-gray-400 focus:border-tech-highlight focus:ring-tech-highlight/20 pr-10"
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
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-tech-accent/20">
              <Button
                type="submit"
                className="w-full tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              
              <Link to="/" className="text-sm text-tech-accent hover:text-tech-highlight hover:underline text-center w-full transition-colors">
                Voltar para o site
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
