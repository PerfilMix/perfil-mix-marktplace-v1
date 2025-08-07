import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface TextSetting {
  id: string;
  key: string;
  value: string;
  active: boolean;
}

const TEXT_SETTINGS = [
  { key: "footer_company_name", label: "Nome da Empresa no Rodapé" },
  { key: "footer_text", label: "Texto Completo do Rodapé (opcional)" },
];

const TextSettingsManager = () => {
  const [settings, setSettings] = useState<Record<string, TextSetting>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch text settings from Supabase
  useEffect(() => {
    const fetchTextSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("type", "text")
          .in("key", TEXT_SETTINGS.map(setting => setting.key));

        if (error) throw error;

        // Convert array to object for easier access
        const settingsObj: Record<string, TextSetting> = {};
        const valuesObj: Record<string, string> = {};
        
        data?.forEach(setting => {
          settingsObj[setting.key] = setting;
          valuesObj[setting.key] = setting.value;
        });
        
        setSettings(settingsObj);
        setFormValues(valuesObj);
      } catch (error) {
        console.error("Error fetching text settings:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as configurações de texto.",
        });
      }
    };

    fetchTextSettings();

    // Set up real-time listener for site_settings changes
    const channel = supabase
      .channel('site-settings-text')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'type=eq.text'
      }, () => {
        fetchTextSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset success message when user starts typing
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // For each text setting, update or create if it doesn't exist
      for (const { key } of TEXT_SETTINGS) {
        const value = formValues[key];
        if (!value) continue;

        if (settings[key]?.id) {
          // Update existing setting
          const { error } = await supabase
            .from("site_settings")
            .update({ 
              value,
              updated_at: new Date().toISOString()
            })
            .eq("id", settings[key].id);

          if (error) throw error;
        } else {
          // Create new setting
          const { error } = await supabase
            .from("site_settings")
            .insert({
              type: "text",
              key,
              value,
              active: true
            });

          if (error) throw error;
        }

        // If updating footer_company_name, also update site_name to keep them synchronized
        if (key === 'footer_company_name') {
          const { data: siteNameData, error: siteNameFetchError } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'site_name')
            .eq('type', 'branding')
            .maybeSingle();

          if (siteNameFetchError) throw siteNameFetchError;

          if (siteNameData) {
            // Update existing site name
            const { error: siteNameUpdateError } = await supabase
              .from('site_settings')
              .update({
                value,
                updated_at: new Date().toISOString()
              })
              .eq('id', siteNameData.id);

            if (siteNameUpdateError) throw siteNameUpdateError;
          } else {
            // Create new site name setting
            const { error: siteNameInsertError } = await supabase
              .from('site_settings')
              .insert({
                type: 'branding',
                key: 'site_name',
                value,
                active: true
              });

            if (siteNameInsertError) throw siteNameInsertError;
          }
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações de texto salvas com sucesso.",
      });

      setSaveSuccess(true);

      // Refresh settings after save
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("type", "text")
        .in("key", TEXT_SETTINGS.map(setting => setting.key));

      if (data) {
        const updatedSettings: Record<string, TextSetting> = {};
        data.forEach(setting => {
          updatedSettings[setting.key] = setting;
        });
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error("Error saving text settings:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações de texto.",
      });
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium mb-4">Configurações de Texto</h3>
          
          {TEXT_SETTINGS.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Textarea
                id={key}
                value={formValues[key] || ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder={
                  key === "footer_company_name" 
                    ? "Será sincronizado automaticamente com o Nome do Site" 
                    : `Digite o ${label.toLowerCase()}`
                }
                rows={key === "footer_text" ? 3 : 2}
                disabled={isSaving}
              />
              {key === "footer_company_name" && (
                <p className="text-xs text-gray-500">
                  Este campo é sincronizado automaticamente com o "Nome do Site". Alterações aqui também atualizarão o nome do site.
                </p>
              )}
              {key === "footer_text" && (
                <p className="text-xs text-gray-500">
                  Deixe em branco para usar o formato padrão com o nome da empresa.
                </p>
              )}
            </div>
          ))}
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`w-full mt-4 ${saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isSaving ? "Salvando..." : saveSuccess ? "Salvo com Sucesso!" : "Salvar Configurações"}
          </Button>
          
          {saveSuccess && (
            <p className="text-center text-green-500 mt-2">
              As alterações já estão visíveis na página inicial.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextSettingsManager;
