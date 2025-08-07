
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Verificar se há parâmetros de redefinição de senha na URL ou no hash
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
    const type = urlParams.get('type') || hashParams.get('type');

    console.log('Parâmetros encontrados:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

    if (type === 'recovery' && accessToken && refreshToken) {
      // Definir a sessão com os tokens da URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao definir sessão:', error);
          setIsValidToken(false);
          toast({
            variant: "destructive",
            title: "Token inválido",
            description: "O link de redefinição de senha expirou ou é inválido.",
          });
        } else {
          console.log('Sessão definida com sucesso');
          setIsValidToken(true);
        }
      });
    } else {
      console.log('Parâmetros inválidos ou ausentes');
      setIsValidToken(false);
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar senha
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password,
        ...(email && { email: email })
      });

      if (passwordError) {
        throw passwordError;
      }

      toast({
        title: "Senha redefinida com sucesso!",
        description: "Sua senha foi atualizada. Você pode fazer login com a nova senha.",
      });

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/login');
    toast({
      title: "Solicite um novo link",
      description: "Acesse a página de login e clique em 'Esqueci minha senha' para receber um novo link.",
    });
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tech-darker via-tech-darker to-tech-card/20">
        <Card className="w-full max-w-md mx-4 glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-white">Link Inválido</CardTitle>
            <CardDescription className="text-gray-300">
              O link de redefinição de senha expirou ou é inválido.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400 text-sm">
              Para redefinir sua senha, você precisa solicitar um novo link através da página de login.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleRequestNewLink}
                className="tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium transition-all duration-300 flex-1"
              >
                Solicitar Novo Link
              </Button>
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full text-tech-highlight hover:bg-tech-accent/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tech-darker via-tech-darker to-tech-card/20">
      <Card className="w-full max-w-md mx-4 glass-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-tech-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-tech-accent" />
          </div>
          <CardTitle className="text-2xl text-white">Redefinir Senha</CardTitle>
          <CardDescription className="text-gray-300">
            Defina sua nova senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Novo E-mail (opcional)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Deixe em branco para manter o atual"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-tech-darker border-tech-accent/30 text-white placeholder-gray-500 focus:border-tech-accent focus:ring-tech-accent/20"
                />
              </div>
            </div>

            {/* Nova senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Nova Senha *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-tech-darker border-tech-accent/30 text-white placeholder-gray-500 focus:border-tech-accent focus:ring-tech-accent/20"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirmar Nova Senha *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 bg-tech-darker border-tech-accent/30 text-white placeholder-gray-500 focus:border-tech-accent focus:ring-tech-accent/20"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-bold py-3 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-tech-accent hover:text-tech-highlight transition-colors text-sm"
              >
                Voltar ao Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
