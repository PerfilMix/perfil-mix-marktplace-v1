
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TikTokAccount } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Package,
  AlertCircle,
  Calendar,
  Target
} from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

interface DashboardMetrics {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  productionAccounts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averagePrice: number;
  adminCommission: number;
  recentSales: TikTokAccount[];
  platformStats: { [key: string]: number };
  countryStats: { [key: string]: number };
}

interface AdminDashboardProps {
  accounts: TikTokAccount[];
}

const AdminDashboard = ({ accounts }: AdminDashboardProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAccounts: 0,
    availableAccounts: 0,
    soldAccounts: 0,
    productionAccounts: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averagePrice: 0,
    adminCommission: 0,
    recentSales: [],
    platformStats: {},
    countryStats: {}
  });

  useEffect(() => {
    calculateMetrics();
  }, [accounts]);

  const calculateMetrics = () => {
    const available = accounts.filter(acc => acc.status === 'disponivel_venda').length;
    const sold = accounts.filter(acc => acc.status === 'vendido').length;
    const production = accounts.filter(acc => acc.status === 'em_producao').length;
    
    const soldAccounts = accounts.filter(acc => acc.status === 'vendido');
    const totalRevenue = soldAccounts.reduce((sum, acc) => sum + acc.preco, 0);
    
    // Vendas do mês atual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = soldAccounts
      .filter(acc => {
        const saleDate = new Date(acc.created_at || '');
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((sum, acc) => sum + acc.preco, 0);

    const averagePrice = accounts.length > 0 ? accounts.reduce((sum, acc) => sum + acc.preco, 0) / accounts.length : 0;
    
    // Comissão do admin (10% das vendas de vendedores)
    const sellerSales = soldAccounts.filter(acc => acc.vendedor_id !== null);
    const adminCommission = sellerSales.reduce((sum, acc) => sum + (acc.preco * 0.1), 0);
    
    // Vendas recentes (últimas 5)
    const recentSales = soldAccounts
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 5);

    // Estatísticas por plataforma
    const platformStats: { [key: string]: number } = {};
    accounts.forEach(acc => {
      platformStats[acc.plataforma] = (platformStats[acc.plataforma] || 0) + 1;
    });

    // Estatísticas por país
    const countryStats: { [key: string]: number } = {};
    accounts.forEach(acc => {
      countryStats[acc.pais] = (countryStats[acc.pais] || 0) + 1;
    });

    setMetrics({
      totalAccounts: accounts.length,
      availableAccounts: available,
      soldAccounts: sold,
      productionAccounts: production,
      totalRevenue,
      monthlyRevenue,
      averagePrice,
      adminCommission,
      recentSales,
      platformStats,
      countryStats
    });
  };

  const getIconColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'text-tech-accent',
      'green': 'text-tech-success', 
      'purple': 'text-violet-500',
      'indigo': 'text-tech-warning',
      'cyan': 'text-tech-info',
      'red': 'text-tech-danger',
      // Legacy fallbacks for any missed colors
      'orange': 'text-tech-warning',
      'yellow': 'text-tech-info',
      'amber': 'text-tech-warning'
    };
    return colorMap[color] || 'text-tech-accent';
  };

  const MetricCard = ({ title, value, icon: Icon, description, color = "blue" }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    color?: string;
  }) => (
    <Card className="glass-card border-tech-accent/20 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getIconColorClass(color)}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Contas"
          value={metrics.totalAccounts}
          icon={Package}
          description="Todas as contas cadastradas"
          color="blue"
        />
        
        <MetricCard
          title="Contas Disponíveis"
          value={metrics.availableAccounts}
          icon={ShoppingCart}
          description="Prontas para venda"
          color="green"
        />
        
        <MetricCard
          title="Contas Vendidas"
          value={metrics.soldAccounts}
          icon={Target}
          description="Vendas realizadas"
          color="purple"
        />
        
        <MetricCard
          title="Em Produção"
          value={metrics.productionAccounts}
          icon={AlertCircle}
          description="Sendo preparadas"
          color="indigo"
        />
      </div>

      {/* Métricas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Faturamento Total"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          description="Receita total de vendas"
          color="green"
        />
        
        <MetricCard
          title="Faturamento Mensal"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={Calendar}
          description="Receita do mês atual"
          color="blue"
        />
        
        <MetricCard
          title="Comissão Admin"
          value={formatCurrency(metrics.adminCommission)}
          icon={Users}
          description="10% das vendas de vendedores"
          color="cyan"
        />
        
        <MetricCard
          title="Preço Médio"
          value={formatCurrency(metrics.averagePrice)}
          icon={TrendingUp}
          description="Média de preço das contas"
          color="purple"
        />
      </div>

      {/* Estatísticas e Vendas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas por Plataforma */}
        <Card className="glass-card border-tech-accent/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribuição por Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.platformStats).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between">
                  <span className="text-gray-300">{platform}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-white border-tech-accent">
                      {count}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {((count / metrics.totalAccounts) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendas Recentes */}
        <Card className="glass-card border-tech-accent/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Vendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentSales.length > 0 ? (
                metrics.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-tech-darker/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{sale.nome}</p>
                      <p className="text-xs text-gray-400">{sale.plataforma} • {sale.pais}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold">{formatCurrency(sale.preco)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(sale.created_at || '').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">Nenhuma venda recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por País */}
      <Card className="glass-card border-tech-accent/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribuição por País
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics.countryStats).map(([country, count]) => (
              <div key={country} className="text-center p-4 bg-tech-darker/50 rounded-lg">
                <p className="text-white font-medium">{country}</p>
                <p className="text-2xl font-bold text-tech-accent">{count}</p>
                <p className="text-xs text-gray-400">
                  {((count / metrics.totalAccounts) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
