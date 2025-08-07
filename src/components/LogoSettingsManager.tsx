import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SiteNameSetting {
  id: string;
  key: string;
  value: string;
  active: boolean;
}

interface LogoSetting {
  id: string;
  key: string;
  value: string;
  active: boolean;
}

const LogoSettingsManager = () => {
  const [siteNameSetting, setSiteNameSetting] = useState<SiteNameSetting | null>(null);
  const [siteName, setSiteName] = useState("");
  const [logoSetting, setLogoSetting] = useState<LogoSetting | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch existing site name setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch site name setting from branding type
        const { data: nameData, error: nameError } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "site_name")
          .eq("type", "branding")
          .maybeSingle();

        if (nameError) throw nameError;

        if (nameData) {
          setSiteNameSetting(nameData);
          setSiteName(nameData.value);
        }

        // Fetch logo setting from branding type
        const { data: logoData, error: logoError } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "site_logo")
          .eq("type", "branding")
          .maybeSingle();

        if (logoError) throw logoError;

        if (logoData) {
          setLogoSetting(logoData);
          setLogoUrl(logoData.value);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as configurações do site.",
        });
      }
    };

    fetchSettings();

    // Set up real-time listener for site_settings changes
    const channel = supabase
      .channel('site-settings-logo')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'type=eq.branding'
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSaveSiteName = async () => {
    if (!siteName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do site não pode estar vazio.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update or create site_name setting
      if (siteNameSetting?.id) {
        // Update existing setting
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({
            value: siteName,
            updated_at: new Date().toISOString()
          })
          .eq('id', siteNameSetting.id);

        if (updateError) throw updateError;
      } else {
        // Create new setting
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert({
            type: 'branding',
            key: 'site_name',
            value: siteName,
            active: true
          });

        if (insertError) throw insertError;
      }

      // Also update or create footer_company_name to keep them synchronized
      const { data: footerData, error: footerFetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'footer_company_name')
        .eq('type', 'text')
        .maybeSingle();

      if (footerFetchError) throw footerFetchError;

      if (footerData) {
        // Update existing footer company name
        const { error: footerUpdateError } = await supabase
          .from('site_settings')
          .update({
            value: siteName,
            updated_at: new Date().toISOString()
          })
          .eq('id', footerData.id);

        if (footerUpdateError) throw footerUpdateError;
      } else {
        // Create new footer company name setting
        const { error: footerInsertError } = await supabase
          .from('site_settings')
          .insert({
            type: 'text',
            key: 'footer_company_name',
            value: siteName,
            active: true
          });

        if (footerInsertError) throw footerInsertError;
      }

      toast({
        title: "Sucesso",
        description: "Nome do site e rodapé atualizados com sucesso!",
      });

      // Refresh site name setting
      const { data: refreshedData } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "site_name")
        .eq("type", "branding")
        .single();

      if (refreshedData) {
        setSiteNameSetting(refreshedData);
      }
    } catch (error) {
      console.error("Error updating site name:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o nome do site.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O arquivo deve ter no máximo 5MB.",
      });
      return;
    }

    setIsUploadingLogo(true);

    try {
      // Upload logo to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      const newLogoUrl = urlData.publicUrl;

      // Save logo URL to site_settings
      if (logoSetting?.id) {
        // Update existing setting
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({
            value: newLogoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', logoSetting.id);

        if (updateError) throw updateError;
      } else {
        // Create new setting
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert({
            type: 'branding',
            key: 'site_logo',
            value: newLogoUrl,
            active: true
          });

        if (insertError) throw insertError;
      }

      setLogoUrl(newLogoUrl);
      
      toast({
        title: "Sucesso",
        description: "Logo atualizado com sucesso!",
      });

      // Refresh logo setting
      const { data: refreshedData } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "site_logo")
        .eq("type", "branding")
        .maybeSingle();

      if (refreshedData) {
        setLogoSetting(refreshedData);
      }

    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível fazer upload do logo.",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
        <CardContent className="pt-6 space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Logotipo do Site</h3>
            
            <div className="space-y-4">
              {logoUrl && (
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={logoUrl} 
                      alt="Logo atual" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Logo atual</p>
                    <p className="text-xs text-gray-500">Selecione um novo arquivo para alterar</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <Label 
                  htmlFor="logo-upload" 
                  className="cursor-pointer inline-flex items-center space-x-2 bg-tech-accent hover:bg-tech-accent/80 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>{isUploadingLogo ? "Enviando..." : "Escolher Arquivo"}</span>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
              </div>
              
              <p className="text-xs text-gray-500">
                Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 5MB.
                <br />
                Recomendado: imagem quadrada ou retangular com fundo transparente.
              </p>
            </div>
          </div>

          {/* Site Name Section */}
          <div className="space-y-4 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white">Nome do Site</h3>
            <div className="space-y-2">
              <Label htmlFor="site-name">Nome do Site</Label>
              <div className="flex space-x-2">
                <Input
                  id="site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Digite o nome do site"
                  disabled={isSaving}
                />
                <Button 
                  onClick={handleSaveSiteName}
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Este nome será mostrado na barra de navegação e no rodapé do site.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoSettingsManager;
