import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  type: 'documento' | 'selfie';
  label: string;
  description: string;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  type,
  label,
  description,
  onUploadComplete,
  currentUrl
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para Supabase Storage
      const fileName = `${user.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('seller-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('seller-documents')
        .getPublicUrl(data.path);

      onUploadComplete(publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar documento. Tente novamente.",
        variant: "destructive"
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-dashed border-2">
      <CardContent className="p-6">
        <div className="text-center">
          <h4 className="font-semibold text-lg mb-2">{label}</h4>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>

          {previewUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt={label}
                className="max-w-full max-h-64 object-contain rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="mt-2 flex items-center justify-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Documento enviado</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
                {type === 'selfie' ? (
                  <Camera className="h-6 w-6 text-gray-400" />
                ) : (
                  <Upload className="h-6 w-6 text-gray-400" />
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mb-2"
              >
                {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </Button>
              
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG até 10MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {type === 'selfie' && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-800">Importante:</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Tire uma selfie segurando o documento de identificação ao lado do seu rosto. 
                    Certifique-se de que tanto seu rosto quanto o documento estejam visíveis e legíveis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};