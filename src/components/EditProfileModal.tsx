
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentImage: string | null;
  userEmail: string;
  onProfileUpdate: (name: string, imageUrl: string | null) => void;
}

const EditProfileModal = ({ 
  isOpen, 
  onClose, 
  currentName, 
  currentImage, 
  userEmail, 
  onProfileUpdate 
}: EditProfileModalProps) => {
  const [name, setName] = useState(currentName);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        description: "Imagem muito grande. O tamanho máximo permitido é 5MB."
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        description: "Apenas arquivos de imagem são permitidos."
      });
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        description: "O nome não pode estar vazio."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          variant: "destructive",
          description: "Você precisa estar logado."
        });
        return;
      }

      let imageUrl = currentImage;

      // Upload da nova imagem se foi selecionada
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${session.user.id}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile_images')
          .upload(fileName, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicURL } = supabase.storage
          .from('profile_images')
          .getPublicUrl(fileName);

        imageUrl = publicURL.publicUrl;
      }

      // Atualizar os dados do usuário
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          name: name.trim(),
          profile_image_url: imageUrl
        })
        .eq('email', userEmail);

      if (updateError) {
        throw updateError;
      }

      // Chamar callback para atualizar o estado no componente pai
      onProfileUpdate(name.trim(), imageUrl);

      toast({
        description: "Perfil atualizado com sucesso!"
      });

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        description: "Erro ao atualizar perfil. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setSelectedImage(null);
    setPreviewUrl(null);
    onClose();
  };

  const displayImage = previewUrl || currentImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px] bg-tech-card border-tech-accent/30">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Perfil</DialogTitle>
          <DialogDescription className="text-gray-300">
            Atualize suas informações pessoais.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Campo Nome */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-tech-darker border-tech-accent/30 text-white"
              placeholder="Digite seu nome"
            />
          </div>

          {/* Upload de Imagem */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-white">
              Foto
            </Label>
            <div className="col-span-3 flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-tech-highlight/20">
                {displayImage ? (
                  <AvatarImage src={displayImage} alt="Preview" />
                ) : (
                  <AvatarFallback className="bg-tech-highlight text-white">
                    <User size={24} />
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div>
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-tech-accent text-white hover:bg-tech-accent/20"
                    asChild
                  >
                    <div className="flex items-center gap-2">
                      <Upload size={16} />
                      Escolher foto
                    </div>
                  </Button>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Máximo 5MB
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="border-tech-accent text-white hover:bg-tech-accent/20"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
