import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface AccountScreenshotUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string | null) => void;
  required?: boolean;
}

const AccountScreenshotUpload = ({
  currentImageUrl,
  onImageUpload,
  required = false
}: AccountScreenshotUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const { uploadImage, uploading } = useImageUpload();

  // Sincroniza estado interno com a prop do pai
  useEffect(() => {
    console.log("AccountScreenshotUpload: currentImageUrl changed to:", currentImageUrl);
    setPreviewUrl(currentImageUrl || null);
    setImageLoadError(false);
  }, [currentImageUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("AccountScreenshotUpload: Iniciando upload do arquivo:", file.name);
    
    const imageUrl = await uploadImage(file, "account-profiles");
    console.log("AccountScreenshotUpload: URL retornada do upload:", imageUrl);
    
    if (imageUrl) {
      setPreviewUrl(imageUrl);
      setImageLoadError(false);
      onImageUpload(imageUrl); // atualiza o estado do pai
      console.log("AccountScreenshotUpload: Imagem definida com sucesso:", imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setImageLoadError(false);
    onImageUpload(null);
    console.log("AccountScreenshotUpload: Imagem removida");
  };

  const handleImageLoad = () => {
    console.log("AccountScreenshotUpload: Imagem carregada com sucesso:", previewUrl);
    setImageLoadError(false);
  };

  const handleImageError = () => {
    console.error("AccountScreenshotUpload: Erro ao carregar imagem:", previewUrl);
    setImageLoadError(true);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="account-screenshot" className="text-foreground">
        Screenshot da Conta {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-card">
          {previewUrl && !imageLoadError ? (
            <img
              src={previewUrl}
              alt="Screenshot da conta"
              className="w-full h-full object-cover rounded-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              {imageLoadError && (
                <span className="text-xs text-destructive mt-1">Erro</span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById("account-screenshot")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Carregando..." : "Carregar Screenshot"}
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
        id="account-screenshot"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />

      <p className="text-sm text-muted-foreground">
        JPG, PNG ou WebP. Máximo 2MB. {required && "Campo obrigatório."}
      </p>
      
      {/* Debug info - remover em produção */}
      {previewUrl && (
        <p className="text-xs text-muted-foreground break-all">
          URL atual: {previewUrl}
        </p>
      )}
    </div>
  );
};

export default AccountScreenshotUpload;
