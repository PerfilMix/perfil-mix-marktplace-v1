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
  const { uploadImage, uploading } = useImageUpload();

  // Sincroniza estado interno com a prop do pai
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file, "account-profiles");
    if (imageUrl) {
      setPreviewUrl(imageUrl);
      onImageUpload(imageUrl); // atualiza o estado do pai
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload(null);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="account-screenshot" className="text-white">
        Screenshot da Conta {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 border-2 border-dashed border-tech-border rounded-lg flex items-center justify-center bg-tech-darker">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Screenshot da conta"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById("account-screenshot")?.click()}
            className="border-tech-border text-white hover:bg-tech-secondary/20"
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
              className="border-tech-border text-white hover:bg-tech-secondary/20"
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

      <p className="text-sm text-gray-400">
        JPG, PNG ou WebP. Máximo 2MB. {required && "Campo obrigatório."}
      </p>
    </div>
  );
};

export default AccountScreenshotUpload;
