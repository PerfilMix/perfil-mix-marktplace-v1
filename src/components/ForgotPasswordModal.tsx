
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

const ForgotPasswordModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Por favor, informe seu e-mail para recuperar a senha.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://perfilmix.com.br/reset-password",
      });

      if (error) {
        console.error("Erro específico de recuperação:", error);
        
        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes('Email not confirmed')) {
          toast({
            variant: "destructive",
            title: "Email não confirmado",
            description: "Por favor, confirme seu email antes de solicitar recuperação de senha.",
          });
        } else if (error.message.includes('User not found')) {
          toast({
            variant: "destructive",
            title: "Email não encontrado",
            description: "Este email não está cadastrado em nosso sistema.",
          });
        } else if (error.message.includes('Error sending confirmation email')) {
          toast({
            variant: "destructive",
            title: "Erro no envio",
            description: "Não foi possível enviar o email de recuperação. Tente novamente em alguns minutos.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao enviar e-mail",
            description: "Não foi possível enviar o e-mail de recuperação. Verifique o email informado.",
          });
        }
        return;
      }

      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para o link de recuperação de senha.",
      });

      setEmail("");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="link" 
          className="text-tech-accent hover:text-tech-highlight p-0 h-auto font-normal"
        >
          Esqueci minha senha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-tech-card border-tech-accent/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-tech-highlight" />
            Recuperar Senha
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Digite seu e-mail para receber um link de recuperação de senha.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleResetPassword}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-tech-highlight font-medium">
                E-mail
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-tech-darker border-tech-accent/30 text-white placeholder:text-gray-500 focus:border-tech-highlight focus:ring-tech-highlight/20"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </div>
              ) : (
                "Enviar Link de Recuperação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
