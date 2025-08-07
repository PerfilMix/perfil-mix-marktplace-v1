
import { Mail, MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneDisplay, getWhatsAppUrl } from "@/lib/phoneFormat";

interface FooterSettings {
  companyName: string;
  footerText: string;
}

const Footer = () => {
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: "PerfilMix",
    footerText: ""
  });

  const [supportSettings, setSupportSettings] = useState({
    support_email: "suporte@perfilmix.com.br",
    support_phone: "(49) 9 9802-9271"
  });

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const { data: textData, error } = await supabase
          .from("site_settings")
          .select("key, value")
          .eq("type", "text")
          .in("key", ["footer_company_name", "footer_text"])
          .eq("active", true);

        if (error) {
          console.error("Error fetching footer settings:", error);
          return;
        }

        // If no footer_company_name, try to get site_name from branding
        let companyName = "PerfilMix";
        let footerText = "";

        if (textData) {
          const footerCompanyName = textData.find(item => item.key === "footer_company_name");
          const footerTextData = textData.find(item => item.key === "footer_text");
          
          if (footerCompanyName) {
            companyName = footerCompanyName.value;
          }
          
          if (footerTextData) {
            footerText = footerTextData.value;
          }
        }

        // If no footer_company_name found, fallback to site_name
        if (companyName === "PerfilMix") {
          const { data: brandingData, error: brandingError } = await supabase
            .from("site_settings")
            .select("value")
            .eq("type", "branding")
            .eq("key", "site_name")
            .eq("active", true)
            .single();

          if (!brandingError && brandingData) {
            companyName = brandingData.value;
          }
        }

        setFooterSettings({
          companyName,
          footerText
        });
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      }
    };

    const fetchSupportSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .eq('type', 'support')
          .eq('active', true);

        if (error) {
          console.error("Error fetching support settings:", error);
          return;
        }

        const settingsObj: any = {};
        data?.forEach((setting) => {
          settingsObj[setting.key] = setting.value;
        });

        // Only update if we have support settings, otherwise keep defaults
        if (Object.keys(settingsObj).length > 0) {
          setSupportSettings(prevSettings => ({
            ...prevSettings,
            ...settingsObj
          }));
        }
      } catch (error) {
        console.error("Error fetching support settings:", error);
      }
    };

    fetchFooterSettings();
    fetchSupportSettings();

    // Set up real-time listener for footer settings changes
    const channel = supabase
      .channel('footer-settings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'type=eq.text'
      }, () => {
        fetchFooterSettings();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'type=eq.branding'
      }, () => {
        fetchFooterSettings();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'type=eq.support'
      }, () => {
        fetchSupportSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <footer className="footer-bg border-t border-tech-accent/20 mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Links das páginas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Informações</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/termos-de-uso" 
                  className="text-gray-300 hover:text-tech-accent transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/politica-de-privacidade" 
                  className="text-gray-300 hover:text-tech-accent transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  to="/como-comprar" 
                  className="text-gray-300 hover:text-tech-accent transition-colors"
                >
                  Como Comprar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contato</h3>
            <div className="space-y-3">
              <a 
                href={`mailto:${supportSettings.support_email}`}
                className="flex items-center text-gray-300 hover:text-tech-accent transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                {supportSettings.support_email}
              </a>
              <a 
                href={getWhatsAppUrl(supportSettings.support_phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-tech-accent transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {formatPhoneDisplay(supportSettings.support_phone)}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{footerSettings.companyName}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sua plataforma confiável para aquisição de contas de redes sociais 
              com diferentes perfis e segmentação por nicho.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-tech-accent/20 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            {footerSettings.footerText || `© 2024 ${footerSettings.companyName}. Todos os direitos reservados.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
