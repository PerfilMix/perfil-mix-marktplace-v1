

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, bucket: string = 'account-profiles'): Promise<string | null> => {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem JPG, PNG ou WebP.",
      });
      return null;
    }

    // Validar tamanho do arquivo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
      });
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      toast({
        title: "Imagem carregada",
        description: "A imagem foi carregada com sucesso.",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem. Tente novamente.",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string, bucket: string = 'account-profiles'): Promise<boolean> => {
    try {
      // Extrair o nome do arquivo da URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading
  };
};
