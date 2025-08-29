import { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload"; // importa o seu hook

export default function ProfileImage() {
  const { uploadImage, uploading } = useImageUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file); // chama o hook
    if (url) {
      setImageUrl(url); // guarda a URL pública no estado
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Se já tem imagem, mostra */}
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

      {/* Input para enviar imagem */}
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
