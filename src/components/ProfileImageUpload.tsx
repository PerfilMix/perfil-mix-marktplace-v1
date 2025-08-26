import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string | null) => void;
  accountName: string;
  title?: string;
}

const ProfileImageUpload = ({ currentImageUrl, onImageUpload, accountName, title = "Foto de Perfil" }: ProfileImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem JPG, PNG ou WebP.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName; // se quiser subpasta: `uploads/${fileName}`

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('account-profiles')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Pega URL pública
      const { data } = supabase.storage
        .from('account-profiles')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;
      setPreviewUrl(imageUrl);
      onImageUpload(imageUrl);

      toast({
        title: "Imagem carregada",
        description: "A foto de perfil foi carregada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem. Tente novamente.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="profile-image">{title}</Label>
      
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={previewUrl || undefined} />
          <AvatarFallback className="text-lg">
            {getInitials(accountName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('profile-image')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Carregando..." : "Carregar Foto"}
          </Button>
          
          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          )}
        </div>
      </div>

      <Input
        id="profile-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />
      
      <p className="text-sm text-gray-500">
        JPG, PNG ou WebP. Máximo 2MB.
      </p>
    </div>
  );
};

export default ProfileImageUpload;
