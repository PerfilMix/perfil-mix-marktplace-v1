import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Upload, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TikTokAccount } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ComplaintModalProps {
  account: TikTokAccount;
  onComplaintSubmitted: () => void;
}

const ComplaintModal = ({ account, onComplaintSubmitted }: ComplaintModalProps) => {
  const [open, setOpen] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o problema encontrado.",
        variant: "destructive",
      });
      return;
    }

    if (!image) {
      toast({
        title: "Erro",
        description: "Por favor, anexe um print do erro ou problema que está ocorrendo.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer uma reclamação.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload da imagem se fornecida
      if (image) {
        const fileName = `complaint-${Date.now()}-${image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('account-profiles')
          .upload(fileName, image);

        if (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          toast({
            title: "Aviso",
            description: "A reclamação foi enviada, mas houve um problema com o upload da imagem.",
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('account-profiles')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      }

      // Buscar dados do usuário para o telefone (se disponível)
      const { data: userData } = await supabase
        .from('users')
        .select('telefone')
        .eq('id', user.id)
        .single();

      // Buscar dados do vendedor para o telefone (se a conta tem vendedor)
      let vendedorTelefone = null;
      if (account.vendedor_id) {
        const { data: vendedorData } = await supabase
          .from('seller_requests')
          .select('telefone')
          .eq('user_id', account.vendedor_id)
          .single();
        vendedorTelefone = vendedorData?.telefone;
      }

      // Salvar a reclamação
      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          usuario_id: user.id,
          conta_id: account.id,
          vendedor_id: account.vendedor_id || null,
          texto: complaint.trim(),
          imagem_url: imageUrl,
          usuario_telefone: userData?.telefone || null,
          vendedor_telefone: vendedorTelefone,
          status: 'pendente'
        });

      if (insertError) {
        console.error('Erro ao salvar reclamação:', insertError);
        toast({
          title: "Erro",
          description: "Erro ao enviar reclamação. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Reclamação enviada!",
        description: "Sua reclamação foi registrada e será analisada pela nossa equipe.",
      });

      setComplaint("");
      setImage(null);
      setOpen(false);
      onComplaintSubmitted();

    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar reclamação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Reclamar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-tech-darker border-tech-accent/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reportar Problema - {account.nome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-300 text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Para facilitar a resolução do problema, é obrigatório anexar um print ou imagem que comprove a situação relatada.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint" className="text-gray-300">
              Descreva o problema encontrado *
            </Label>
            <Textarea
              id="complaint"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Ex: A conta não permite login, senha está incorreta, conta foi suspensa, etc."
              className="bg-black/20 border-white/10 text-white placeholder-gray-400"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-gray-300">
              Anexe um print do erro que está ocorrendo ou do problema que está tendo *
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-black/20 border-white/10 text-white file:text-white file:bg-tech-accent/20 file:border-0"
              />
              {image && (
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  {image.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting || !complaint.trim() || !image}
            >
              {isSubmitting ? "Enviando..." : "Enviar Reclamação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintModal;