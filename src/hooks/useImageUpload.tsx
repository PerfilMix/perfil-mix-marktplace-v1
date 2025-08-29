import { useState } from "react";
import { useImageUpload } from "../hooks/useImageUpload"; // caminho relativo

export default function ProfileImage() {
  const { uploadImage, uploading } = useImageUpload();
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) setImageUrl(url);
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
