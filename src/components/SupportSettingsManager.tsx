import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Loader } from "lucide-react";

interface SupportSettings {
  support_email: string;
  support_phone: string;
}

const SupportSettingsManager = () => {
  const [settings, setSettings] = useState<SupportSettings>({
    support_email: '',
    support_phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Set up real-time listener for site_settings changes
    const channel = supabase
      .channel('support-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'type=eq.support'
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("type", "support")
        .eq("active", true);

      if (error) throw error;

      const settingsObj: Partial<SupportSettings> = {};
      data?.forEach((setting) => {
        if (setting.key === 'support_email') {
          settingsObj.support_email = setting.value;
        } else if (setting.key === 'support_phone') {
          settingsObj.support_phone = setting.value;
        }
      });

      setSettings({
        support_email: settingsObj.support_email || '',
        support_phone: settingsObj.support_phone || ''
      });
    } catch (error) {
      console.error("Error fetching support settings:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar configurações de suporte."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Prepare upsert operations for each setting
      const settingsToSave = [
        {
          key: 'support_email',
          value: settings.support_email,
          type: 'support'
        },
        {
          key: 'support_phone', 
          value: settings.support_phone,
          type: 'support'
        }
      ];

      for (const setting of settingsToSave) {
        if (setting.value.trim()) {
          // Check if setting exists
          const { data: existingData, error: selectError } = await supabase
            .from('site_settings')
            .select('id')
            .eq('key', setting.key)
            .eq('type', 'support')
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            throw selectError;
          }

          if (existingData) {
            // Update existing setting
            const { error: updateError } = await supabase
              .from('site_settings')
              .update({
                value: setting.value,
                active: true,
                updated_at: new Date().toISOString()
              })
              .eq('key', setting.key)
              .eq('type', 'support');

            if (updateError) throw updateError;
          } else {
            // Insert new setting
            const { error: insertError } = await supabase
              .from('site_settings')
              .insert({
                key: setting.key,
                value: setting.value,
                type: 'support',
                active: true
              });

            if (insertError) throw insertError;
          }
        } else {
          // If value is empty, deactivate the setting
          const { error: deactivateError } = await supabase
            .from('site_settings')
            .update({ active: false })
            .eq('key', setting.key)
            .eq('type', 'support');

          if (deactivateError) throw deactivateError;
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações de suporte salvas com sucesso!"
      });
    } catch (error) {
      console.error("Error saving support settings:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar configurações de suporte."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof SupportSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <Card style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Configurações de Suporte
          </CardTitle>
          <CardDescription>
            Configure os dados de contato de suporte exibidos no site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Configurações de Suporte
        </CardTitle>
        <CardDescription>
          Configure os dados de contato de suporte exibidos no site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="support_email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail de Suporte
            </Label>
            <Input
              id="support_email"
              type="email"
              placeholder="suporte@exemplo.com.br"
              value={settings.support_email}
              onChange={(e) => handleInputChange('support_email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support_phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone de Suporte
            </Label>
            <Input
              id="support_phone"
              type="tel"
              placeholder="(49) 9 9802-9271"
              value={settings.support_phone}
              onChange={(e) => handleInputChange('support_phone', e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full md:w-auto"
          >
            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportSettingsManager;