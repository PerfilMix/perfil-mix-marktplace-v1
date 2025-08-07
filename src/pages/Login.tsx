
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, Mail, Lock, UserPlus, CheckCircle, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [telefone, setTelefone] = useState("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const { user, loading } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(redirectPath);
    }
  }, [user, loading, navigate, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        
        // Não exibir mensagens de erro durante processo de redefinição de senha
        if (window.location.pathname.includes('reset-password') || 
            error.message.includes('missing email or phone')) {
          return;
        }
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            variant: "destructive",
            title: "E-mail não confirmado",
            description: "Por favor, confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro no login",
            description: error.message
          });
        }
        return;
      }

      console.log('Login successful for user:', data.user?.id);
      toast({
        description: "Login realizado com sucesso!"
      });

      // Redirecionar para dashboard ou página específica
      navigate(redirectPath);
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!name || name.trim() === "") {
      toast({
        variant: "destructive",
        title: "Nome é obrigatório",
        description: "Por favor, informe seu nome para criar conta."
      });
      setIsLoading(false);
      return;
    }

    if (!telefone || telefone.trim() === "") {
      toast({
        variant: "destructive",
        title: "Telefone é obrigatório",
        description: "Por favor, informe seu telefone para criar conta."
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting signup for:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            telefone: telefone.trim()
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Email já cadastrado",
            description: "Este email já está em uso. Por favor, faça login."
          });
        } else if (error.message.includes('Password should contain at least one character')) {
          toast({
            variant: "destructive",
            title: "Senha inválida",
            description: "A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número. Exemplo: MinhaSenh@123"
          });
        } else if (error.message.includes('Error sending confirmation email') || error.message.includes('short response: 450')) {
          toast({
            variant: "destructive",
            title: "Erro no envio do e-mail",
            description: "Verifique se o e-mail remetente está configurado com um endereço do domínio verificado (ex: noreply@emails.perfilmix.com.br) nas configurações SMTP do Supabase."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao criar conta",
            description: error.message
          });
        }
        return;
      }

      console.log('Signup successful for user:', data.user?.id);
      
      // Show email confirmation message
      setShowEmailConfirmation(true);
      
      // Clear form fields
      setName("");
      setEmail("");
      setPassword("");
      setTelefone("");

    } catch (error) {
      console.error("Unexpected signup error:", error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-tech-darker via-tech-darker to-tech-card/20">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-tech-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show email confirmation message
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-tech-darker via-tech-darker to-tech-card/20">
        <Navbar />
        
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-tech-highlight transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Voltar ao marketplace
            </Link>

            <Card className="glass-card-strong border-tech-accent/30 overflow-hidden">
              <div className="absolute inset-0 tech-gradient-subtle opacity-30"></div>
              <CardHeader className="relative z-10 text-center pb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <CardTitle className="text-2xl text-white font-semibold">Confirme seu E-mail</CardTitle>
                <CardDescription className="text-gray-300">
                  Enviamos um e-mail de confirmação para você
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 text-center space-y-4">
                <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>Verifique sua caixa de entrada</strong><br />
                    Clique no link de confirmação que enviamos para ativar sua conta.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>Não encontrou o e-mail?</strong><br />
                    Verifique a pasta de spam ou lixo eletrônico.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="relative z-10 pt-6">
                <Button
                  onClick={() => setShowEmailConfirmation(false)}
                  variant="outline"
                  className="w-full border-tech-accent text-tech-accent hover:bg-tech-accent hover:text-white"
                >
                  Voltar ao Login
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-tech-darker via-tech-darker to-tech-card/20">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 tech-gradient opacity-5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-tech-highlight to-tech-accent opacity-5 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-tech-highlight transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao marketplace
          </Link>

          <div className="animate-in">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-tech-card/50 border border-tech-accent/20">
                <TabsTrigger value="login" className="data-[state=active]:bg-tech-gradient data-[state=active]:text-white text-gray-400">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-tech-gradient data-[state=active]:text-white text-gray-400">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastro
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card className="glass-card-strong border-tech-accent/30 overflow-hidden">
                  <div className="absolute inset-0 tech-gradient-subtle opacity-30"></div>
                  <CardHeader className="relative z-10 text-center pb-2">
                    <CardTitle className="text-2xl text-white font-semibold">Bem-vindo de volta</CardTitle>
                    <CardDescription className="text-gray-300">Faça login para gerenciar seus Perfis ou Lojas</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6 relative z-10 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-tech-highlight font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-tech-darker/80 border-tech-accent/30 text-white placeholder:text-gray-500 focus:border-tech-highlight focus:ring-tech-highlight/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-tech-highlight font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Senha
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-tech-darker/80 border-tech-accent/30 text-white placeholder:text-gray-500 focus:border-tech-highlight focus:ring-tech-highlight/20 h-12 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <ForgotPasswordModal />
                      </div>
                      
                      {redirectPath !== "/dashboard" && (
                        <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                          <p className="text-sm text-blue-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                            Após o login, você será redirecionado para a página solicitada.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="relative z-10 pt-6">
                      <Button
                        type="submit"
                        className="w-full btn-primary h-12 text-base font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Entrando...
                          </div>
                        ) : (
                          "Entrar"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card className="glass-card-strong border-tech-accent/30 overflow-hidden">
                  <div className="absolute inset-0 tech-gradient-subtle opacity-30"></div>
                  <CardHeader className="relative z-10 text-center pb-2">
                    <CardTitle className="text-2xl text-white font-semibold">Criar Conta</CardTitle>
                    <CardDescription className="text-gray-300">Crie sua conta para começar a comprar perfis verificados</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignup}>
                    <CardContent className="space-y-6 relative z-10 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-tech-highlight font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome
                        </Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="bg-tech-darker/80 border-tech-accent/30 text-white placeholder:text-gray-500 focus:border-tech-highlight focus:ring-tech-highlight/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-telefone" className="text-tech-highlight font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </Label>
                        <Input
                          id="signup-telefone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          required
                          className="bg-tech-darker/80 border-tech-accent/30 text-white placeholder:text-gray-500 focus:border-tech-highlight focus:ring-tech-highlight/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-tech-highlight font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-mail
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-tech-darker/80 border-tech-accent/30 text-white placeholder:text-gray-500 focus:border-tech-highlight focus:ring-tech-highlight/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-tech-highlight font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Senha
                        </Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-tech-darker/80 border-tech-accent/30 text-white placeholder:text-gray-500 focus:border-tech-highlight focus:ring-tech-highlight/20 h-12 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                          >
                            {showSignupPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                        <p className="text-sm text-blue-200">
                          <strong>Confirmação por e-mail obrigatória</strong><br />
                          Após criar sua conta, você receberá um e-mail de confirmação que deve ser clicado antes de fazer login.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="relative z-10 pt-6">
                      <Button
                        type="submit"
                        className="w-full btn-primary h-12 text-base font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Criando...
                          </div>
                        ) : (
                          "Criar Conta"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
