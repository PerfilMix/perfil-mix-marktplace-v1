import { useState } from "react";
import { 
  Home, 
  User, 
  ShoppingBag, 
  Store, 
  DollarSign, 
  History,
  Plus,
  BarChart3
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardBanner from "@/components/dashboard/DashboardBanner";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  purchasesCount: number;
}

const AppSidebar = ({ activeSection, onSectionChange, purchasesCount }: AppSidebarProps) => {
  const { state } = useSidebar();
  const { userProfile, getUserInitials } = useAuth();
  const collapsed = state === "collapsed";

  const userItems = [
    { 
      id: "purchases", 
      title: "Minhas Compras", 
      icon: ShoppingBag,
      badge: purchasesCount > 0 ? purchasesCount.toString() : undefined,
      description: "Contas compradas"
    },
    { 
      id: "profile", 
      title: "Meu Perfil", 
      icon: User,
      description: "Informações pessoais"
    },
  ];

  // Verificar se o vendedor está bloqueado (só considera bloqueado se for vendedor aprovado E estiver com vendas bloqueadas)
  const isSellerBlocked = userProfile?.is_approved_seller && userProfile?.seller_sales_blocked;

  const sellerItems = [
    { 
      id: "seller-overview", 
      title: "Visão Financeira", 
      icon: BarChart3,
      description: "Vendas e saldos"
    },
    // Só mostrar estas opções se o vendedor não estiver bloqueado
    ...(isSellerBlocked ? [] : [
      { 
        id: "seller-accounts", 
        title: "Minhas Contas", 
        icon: Store,
        description: "Contas para venda"
      },
      { 
        id: "cadastrar-conta", 
        title: "Cadastrar Conta", 
        icon: Plus,
        description: "Adicionar nova conta"
      },
    ]),
  ];

  if (!userProfile) return null;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-tech-darker border-r border-tech-border">
        {/* User Profile Section */}
        {!collapsed && (
          <div className="p-4 border-b border-tech-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-tech-accent/30">
                {userProfile.profile_image_url ? (
                  <AvatarImage src={userProfile.profile_image_url} alt={userProfile.name} />
                ) : (
                  <AvatarFallback className="bg-tech-highlight text-white text-sm">
                    {getUserInitials(userProfile.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {userProfile.name}
                </p>
                <p className="text-tech-light text-xs truncate">
                  {userProfile.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-tech-light text-xs uppercase tracking-wider">
            Usuário
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      w-full justify-start text-left hover:bg-tech-secondary/50 
                      ${activeSection === item.id ? 'bg-tech-highlight/20 text-tech-highlight border-r-2 border-tech-highlight' : 'text-tech-light'}
                    `}
                  >
                    <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 bg-tech-highlight text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seller Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-tech-light text-xs uppercase tracking-wider">
            Vendedor
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sellerItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      w-full justify-start text-left hover:bg-tech-secondary/50 
                      ${activeSection === item.id ? 'bg-tech-highlight/20 text-tech-highlight border-r-2 border-tech-highlight' : 'text-tech-light'}
                    `}
                  >
                    <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    {!collapsed && <span className="text-sm">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dashboard Banner Section */}
        {!collapsed && (
          <div className="p-4 mt-auto">
            <DashboardBanner />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;