import { useState, useEffect } from "react";
import { useImageUpload } from "../hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";

interface ProfileImageProps {
  userId: string; // ID do usuário atual
}

export default function ProfileImage({ userId }: ProfileImageProps) {
  const { uploadImage, uploading } = useImageUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Carrega a imagem do banco ao abrir o componente
  useEffect(() => {
    const fetchProfileImage = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();

      if (!error && data?.avatar_url) {
        setImageUrl(data.avatar_url);
      }
    };

    fetchProfileImage();
  }, [userId]);

  // Função para upload e salvar no banco
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      setImageUrl(url);

      // Atualiza a URL no banco
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userId);

      if (error) {
        console.error("Erro ao salvar avatar no banco:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Foto de perfil"
          className="h-32 w-32 rounded-full object-cover border"
        />
      ) : (
        <div className="h-32 w-32 flex items-center justify-center rounded-full border text-gray-500">
          Sem imagem
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && <p>Carregando...</p>}
    </div>
  );
}
