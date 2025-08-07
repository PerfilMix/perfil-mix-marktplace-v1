
import { Plus, Settings, Users, User, UserCheck, BarChart3, UsersRound, DollarSign, MessageSquare, Shield } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { usePendingWithdrawals } from "@/hooks/usePendingWithdrawals";
import { usePendingComplaints } from "@/hooks/usePendingComplaints";
import { usePendingSellerRequests } from "@/hooks/usePendingSellerRequests";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [{
  id: "dashboard",
  label: "Dashboard",
  icon: BarChart3
}, {
  id: "add",
  label: "Adicionar Conta",
  icon: Plus
}, {
  id: "manage",
  label: "Gerenciar Contas",
  icon: Settings
}, {
  id: "manual-registration",
  label: "Cadastro Manual",
  icon: UserCheck
}, {
  id: "complaints",
  label: "Reclamações",
  icon: MessageSquare
}, {
  id: "seller-requests",
  label: "Solicitações de Vendas",
  icon: UserCheck
}, {
  id: "seller-control",
  label: "Controle de Vendedores",
  icon: UsersRound
}, {
  id: "users",
  label: "Controle de Usuários",
  icon: Users
}, {
  id: "admins",
  label: "Controle de ADM",
  icon: Shield
}, {
  id: "personalize",
  label: "Personalização",
  icon: User
}];

export function AdminSidebar({
  activeTab,
  onTabChange
}: AdminSidebarProps) {
  const {
    state
  } = useSidebar();
  const pendingWithdrawals = usePendingWithdrawals();
  const pendingComplaints = usePendingComplaints();
  const pendingSellerRequests = usePendingSellerRequests();

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="glass-card border-tech-accent/20 bg-header-bg">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 px-4 py-2">
            Painel Admin
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.id)} 
                    className={`
                      w-full justify-start px-4 py-3 transition-colors
                      ${activeTab === item.id ? "bg-tech-accent text-white shadow-glow" : "text-gray-300 hover:bg-tech-accent/20 hover:text-white"}
                    `}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {state !== "collapsed" && (
                      <span className="font-medium flex items-center gap-2">
                        {item.label}
                        {item.id === "seller-control" && pendingWithdrawals > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {pendingWithdrawals}
                          </span>
                        )}
                        {item.id === "complaints" && pendingComplaints > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {pendingComplaints}
                          </span>
                        )}
                        {item.id === "seller-requests" && pendingSellerRequests > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {pendingSellerRequests}
                          </span>
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
