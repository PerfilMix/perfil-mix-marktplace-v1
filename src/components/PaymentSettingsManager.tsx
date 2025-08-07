
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethodSetting {
  id: string;
  key: string;
  value: string;
  active: boolean;
}

const PaymentSettingsManager = () => {
  const [pixEnabled, setPixEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [pixSetting, setPixSetting] = useState<PaymentMethodSetting | null>(null);
  const [cardSetting, setCardSetting] = useState<PaymentMethodSetting | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch payment method settings from Supabase
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      console.log("Carregando configurações de pagamento...");
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("type", "payment")
          .in("key", ["payment_method_pix", "payment_method_card"]);

        if (error) {
          console.error("Erro ao buscar configurações:", error);
          throw error;
        }

        console.log("Configurações encontradas:", data);

        // Initialize with default values if no settings found
        let pixFound = false;
        let cardFound = false;

        data?.forEach(setting => {
          if (setting.key === "payment_method_pix") {
            setPixSetting(setting);
            setPixEnabled(setting.value === "true");
            pixFound = true;
          } else if (setting.key === "payment_method_card") {
            setCardSetting(setting);
            setCardEnabled(setting.value === "true");
            cardFound = true;
          }
        });

        // If settings don't exist, they should have been created by the migration
        // But let's verify and create them if needed
        if (!pixFound || !cardFound) {
          console.log("Algumas configurações não foram encontradas, recarregando...");
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
          
          const { data: retryData, error: retryError } = await supabase
            .from("site_settings")
            .select("*")
            .eq("type", "payment")
            .in("key", ["payment_method_pix", "payment_method_card"]);

          if (retryError) throw retryError;

          retryData?.forEach(setting => {
            if (setting.key === "payment_method_pix") {
              setPixSetting(setting);
              setPixEnabled(setting.value === "true");
            } else if (setting.key === "payment_method_card") {
              setCardSetting(setting);
              setCardEnabled(setting.value === "true");
            }
          });
        }

      } catch (error) {
        console.error("Erro ao carregar configurações de pagamento:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as configurações de pagamento.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentSettings();
  }, [toast]);

  const handlePixChange = async (checked: boolean) => {
    console.log("Mudando PIX para:", checked);
    
    // Não permitir desabilitar ambos os métodos
    if (!checked && !cardEnabled) {
      toast({
        variant: "destructive",
        title: "Atenção",
        description: "Pelo menos um método de pagamento deve estar habilitado.",
      });
      return;
    }

    setPixEnabled(checked);
    await savePaymentSetting("payment_method_pix", checked ? "true" : "false", pixSetting);
  };

  const handleCardChange = async (checked: boolean) => {
    console.log("Mudando Cartão para:", checked);
    
    // Não permitir desabilitar ambos os métodos
    if (!checked && !pixEnabled) {
      toast({
        variant: "destructive",
        title: "Atenção", 
        description: "Pelo menos um método de pagamento deve estar habilitado.",
      });
      return;
    }

    setCardEnabled(checked);
    await savePaymentSetting("payment_method_card", checked ? "true" : "false", cardSetting);
  };

  const savePaymentSetting = async (key: string, value: string, existingSetting: PaymentMethodSetting | null) => {
    console.log(`Salvando configuração ${key}:`, value, "Configuração existente:", existingSetting);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (existingSetting?.id) {
        console.log("Atualizando configuração existente:", existingSetting.id);
        
        // Update existing setting
        const { error } = await supabase
          .from("site_settings")
          .update({ 
            value,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingSetting.id);

        if (error) {
          console.error("Erro ao atualizar:", error);
          throw error;
        }
        
        console.log("Configuração atualizada com sucesso");
      } else {
        console.log("Criando nova configuração para:", key);
        
        // Create new setting
        const { error } = await supabase
          .from("site_settings")
          .insert({
            type: "payment",
            key,
            value,
            active: true
          });

        if (error) {
          console.error("Erro ao criar:", error);
          throw error;
        }
        
        console.log("Nova configuração criada com sucesso");
      }

      toast({
        title: "Sucesso",
        description: "Configuração de pagamento salva com sucesso.",
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refresh settings after save
      console.log("Recarregando configurações após salvamento...");
      const { data, error: refreshError } = await supabase
        .from("site_settings")
        .select("*")
        .eq("type", "payment")
        .in("key", ["payment_method_pix", "payment_method_card"]);

      if (refreshError) {
        console.error("Erro ao recarregar:", refreshError);
        throw refreshError;
      }

      console.log("Configurações recarregadas:", data);

      if (data) {
        data.forEach(setting => {
          if (setting.key === "payment_method_pix") {
            setPixSetting(setting);
          } else if (setting.key === "payment_method_card") {
            setCardSetting(setting);
          }
        });
      }
    } catch (error) {
      console.error("Erro ao salvar configuração de pagamento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar a configuração de pagamento.",
      });
      
      // Revert the UI state on error
      if (key === "payment_method_pix") {
        setPixEnabled(!pixEnabled);
      } else if (key === "payment_method_card") {
        setCardEnabled(!cardEnabled);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Carregando configurações...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium mb-4 text-white">Configurações de Pagamento</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="pix-enabled"
                checked={pixEnabled}
                onCheckedChange={handlePixChange}
                disabled={isSaving}
                className="data-[state=checked]:bg-tech-highlight data-[state=checked]:border-tech-highlight"
              />
              <Label htmlFor="pix-enabled" className="text-gray-300 cursor-pointer">
                Habilitar PIX
              </Label>
              {isSaving && pixSetting && (
                <span className="text-xs text-gray-400">(salvando...)</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="card-enabled"
                checked={cardEnabled}
                onCheckedChange={handleCardChange}
                disabled={isSaving}
                className="data-[state=checked]:bg-tech-highlight data-[state=checked]:border-tech-highlight"
              />
              <Label htmlFor="card-enabled" className="text-gray-300 cursor-pointer">
                Habilitar Cartão de Crédito
              </Label>
              {isSaving && cardSetting && (
                <span className="text-xs text-gray-400">(salvando...)</span>
              )}
            </div>

            <div className="text-xs text-gray-400 mt-4">
              <p>• Pelo menos um método de pagamento deve estar habilitado.</p>
              <p>• As mudanças serão aplicadas imediatamente no checkout.</p>
              <p>• PIX: {pixEnabled ? "Habilitado" : "Desabilitado"}</p>
              <p>• Cartão: {cardEnabled ? "Habilitado" : "Desabilitado"}</p>
            </div>

            {saveSuccess && (
              <div className="text-center text-green-500 text-sm">
                ✓ Configurações salvas com sucesso!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettingsManager;
