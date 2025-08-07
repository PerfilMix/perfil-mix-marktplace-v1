import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLocation } from "react-router-dom";
import { getWhatsAppUrl } from "@/lib/phoneFormat";
interface BrandingSettings {
  siteName: string;
  logoUrl: string;
}

interface SupportSettings {
  support_phone: string;
}
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [branding, setBranding] = useState<BrandingSettings>({
    siteName: "PerfilMix",
    logoUrl: "https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/PerfilMix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvUGVyZmlsTWl4LnBuZyIsImlhdCI6MTc1MDczMzY0NywiZXhwIjoyMDY2MDkzNjQ3fQ.xUA6g87KMF1QEzT86gICa2nRjK-X8LiYbHn2k-8xDDI"
  });

  const [supportSettings, setSupportSettings] = useState<SupportSettings>({
    support_phone: "(49) 9 9802-9271"
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');
  
  const {
    user,
    userProfile,
    signOut,
    getUserInitials,
    isAuthenticated
  } = useAuth();
  
  const { 
    admin, 
    logout: adminLogout, 
    isAuthenticated: isAdminAuthenticated 
  } = useAdminAuth();
  useEffect(() => {
    const fetchBrandingSettings = async () => {
      try {
        const { data: brandingData, error } = await supabase
          .from("site_settings")
          .select("key, value")
          .eq("type", "branding")
          .eq("active", true)
          .in("key", ["site_name", "site_logo"]);

        if (error) throw error;

        let siteName = "PerfilMix";
        let logoUrl = "https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/PerfilMix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvUGVyZmlsTWl4LnBuZyIsImlhdCI6MTc1MDczMzY0NywiZXhwIjoyMDY2MDkzNjQ3fQ.xUA6g87KMF1QEzT86gICa2nRjK-X8LiYbHn2k-8xDDI";

        brandingData?.forEach(setting => {
          if (setting.key === "site_name") {
            siteName = setting.value;
          } else if (setting.key === "site_logo") {
            logoUrl = setting.value;
          }
        });

        setBranding({
          siteName,
          logoUrl
        });
      } catch (error) {
        console.error("Error fetching branding settings:", error);
      }
    };

    const fetchSupportSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .eq('type', 'support')
          .eq('key', 'support_phone')
          .eq('active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching support settings:", error);
          return;
        }

        if (data) {
          setSupportSettings({
            support_phone: data.value
          });
        }
      } catch (error) {
        console.error("Error fetching support settings:", error);
      }
    };

    fetchBrandingSettings();
    fetchSupportSettings();

    // Set up real-time listener for branding and support changes
    const channel = supabase.channel('navbar-settings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'type=eq.branding'
      }, () => {
        fetchBrandingSettings();
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
  const handleLogout = async () => {
    try {
      if (isAdminContext) {
        // Logout apenas do admin
        adminLogout();
        navigate('/admin-login');
      } else {
        // Logout do usuário
        await signOut();
        queryClient.clear();
      }
    } catch (error) {
      console.error("Logout error:", error);
      if (isAdminContext) {
        navigate('/admin-login');
      } else {
        window.location.href = '/';
      }
    }
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return <nav className="navbar-bg border-b border-tech-accent/50 py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src={branding.logoUrl} alt="Logo" className="h-12 w-12 mr-2" />
          <span className="text-xl font-bold text-white">{branding.siteName}</span>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Buttons - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* WhatsApp Support Button - Desktop */}
            <a href={getWhatsAppUrl(supportSettings.support_phone)} target="_blank" rel="noopener noreferrer" title="Fale Conosco via WhatsApp" className="flex items-center gap-2 py-1 rounded-lg bg-green-700 hover:bg-green-550 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white font-medium px-[10px] text-sm">
              <img src="https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/whatsapp.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvd2hhdHNhcHAucG5nIiwiaWF0IjoxNzUwOTA4NDEyLCJleHAiOjIwNjYyNjg0MTJ9._HAeLKPE-465VJ10D4z_gSbVb-2O2li4LXiuN0ysOKM" alt="WhatsApp" className="w-7 h-7" />
              Fale Conosco
            </a>

            {/* User Profile or Login Button - Desktop */}
            {(isAuthenticated && userProfile) || (isAdminContext && isAdminAuthenticated) ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer border-2 border-tech-highlight/20 hover:border-tech-highlight/40 transition-colors">
                    {userProfile?.profile_image_url ? <AvatarImage src={userProfile.profile_image_url} alt={userProfile.name} /> : <AvatarFallback className="bg-tech-highlight text-white font-medium text-sm">
                        {getUserInitials(userProfile?.name || admin?.name || 'User')}
                      </AvatarFallback>}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-tech-card border-tech-accent/30" align="end">
                  <DropdownMenuLabel className="text-white">
                    {userProfile?.name || admin?.name || 'User'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-tech-accent/30" />
                  {!isAdminContext && (
                    <DropdownMenuItem className="text-gray-300 hover:bg-tech-accent/20 hover:text-white cursor-pointer" onClick={() => navigate("/dashboard")}>
                      <User className="mr-2 h-4 w-4" />
                      Meu Painel
                    </DropdownMenuItem>
                  )}
                  {isAdminContext && (
                    <DropdownMenuItem className="text-gray-300 hover:bg-tech-accent/20 hover:text-white cursor-pointer" onClick={() => navigate("/admin")}>
                      <User className="mr-2 h-4 w-4" />
                      Painel Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-tech-accent/30" />
                  <DropdownMenuItem className="text-gray-300 hover:bg-tech-accent/20 hover:text-white cursor-pointer" onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Link to="/login">
                <Button variant="outline" className="text-white hover:bg-tech-accent text-sm px-4 py-2 h-10 border-primary/60 hover:border-primary">
                  Fazer Login
                </Button>
              </Link>}
          </div>

          {/* Mobile - Show avatar for authenticated users and hamburger menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Avatar for authenticated users - Mobile */}
            {((isAuthenticated && userProfile) || (isAdminContext && isAdminAuthenticated)) && <Avatar className="h-8 w-8 border-2 border-tech-highlight/20">
                {userProfile?.profile_image_url ? <AvatarImage src={userProfile.profile_image_url} alt={userProfile.name} /> : <AvatarFallback className="bg-tech-highlight text-white font-medium text-xs">
                    {getUserInitials(userProfile?.name || admin?.name || 'User')}
                  </AvatarFallback>}
              </Avatar>}

            {/* Mobile menu button - Always visible */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && <div className="md:hidden navbar-bg absolute top-full left-0 w-full border-b border-tech-accent/50 py-4 px-6 z-50">
          <div className="flex flex-col space-y-4">
            {/* WhatsApp Button - Mobile (same style as desktop) */}
            <a href={getWhatsAppUrl(supportSettings.support_phone)} target="_blank" rel="noopener noreferrer" title="Fale Conosco via WhatsApp" className="flex items-center gap-2 py-1 rounded-lg bg-green-700 hover:bg-green-550 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white font-medium px-[10px] text-sm w-fit" onClick={() => setIsMobileMenuOpen(false)}>
              <img src="https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/whatsapp.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvd2hhdHNhcHAucG5nIiwiaWF0IjoxNzUwOTA4NDEyLCJleHAiOjIwNjYyNjg0MTJ9._HAeLKPE-465VJ10D4z_gSbVb-2O2li4LXiuN0ysOKM" alt="WhatsApp" className="w-7 h-7" />
              Fale Conosco
            </a>

            {(isAuthenticated && userProfile) || (isAdminContext && isAdminAuthenticated) ? <>
                {/* User name */}
                <span className="text-white hover:text-tech-highlight font-medium">
                  {userProfile?.name || admin?.name || 'User'}
                </span>
                
                {/* User menu items */}
                {!isAdminContext && (
                  <Link to="/dashboard" className="text-white hover:text-tech-highlight flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <User size={18} />
                    Meu Painel
                  </Link>
                )}
                
                {isAdminContext && (
                  <Link to="/admin" className="text-white hover:text-tech-highlight flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <User size={18} />
                    Painel Admin
                  </Link>
                )}
                
                <Button onClick={() => {
            handleLogout();
            setIsMobileMenuOpen(false);
          }} variant="ghost" className="justify-start p-0 text-white hover:text-tech-highlight">
                  Sair
                </Button>
              </> : (/* Login Button - Mobile (same style as desktop) */
         <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="text-white hover:bg-tech-accent text-sm px-4 py-2 h-10 w-fit border-primary/60 hover:border-primary">
                  Fazer Login
                </Button>
              </Link>)}
          </div>
        </div>}
    </nav>;
};
export default Navbar;