
import { TikTokAccount } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumberWithK } from "@/lib/helpers";

interface ImprovedAccountsTableProps {
  accounts: TikTokAccount[];
  onEdit: (account: TikTokAccount) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const ImprovedAccountsTable = ({ 
  accounts, 
  onEdit, 
  onDelete, 
  isLoading 
}: ImprovedAccountsTableProps) => {
  const displayNicho = (account: TikTokAccount) => {
    return account.nicho === "Outros" && account.nicho_customizado 
      ? account.nicho_customizado 
      : account.nicho;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponivel_venda":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 text-white">
            Disponível para Venda
          </Badge>
        );
      case "em_producao":
        return (
          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Em Produção
          </Badge>
        );
      case "vendido":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white">
            Vendido
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-600 hover:bg-gray-700 text-white">
            {status}
          </Badge>
        );
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors = {
      TikTok: "bg-pink-600",
      Instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
      YouTube: "bg-red-600",
      Facebook: "bg-blue-600",
      Kwai: "bg-purple-600",
      Shopify: "bg-emerald-600"
    };
    
    return (
      <Badge className={`${colors[platform as keyof typeof colors] || "bg-gray-600"} text-white`}>
        {platform}
      </Badge>
    );
  };

  if (isLoading && accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Carregando contas...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-tech-accent/20">
            <TableHead className="font-semibold text-gray-300">Nome</TableHead>
            <TableHead className="font-semibold text-gray-300">Plataforma</TableHead>
            <TableHead className="font-semibold text-gray-300">Nicho</TableHead>
            <TableHead className="font-semibold text-gray-300">Seguidores/Clientes</TableHead>
            <TableHead className="font-semibold text-gray-300">Preço</TableHead>
            <TableHead className="font-semibold text-gray-300">Status</TableHead>
            <TableHead className="font-semibold text-gray-300">País</TableHead>
            <TableHead className="font-semibold text-gray-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <TableRow 
                key={account.id} 
                className="hover:bg-tech-accent/10 transition-colors duration-150 border-tech-accent/20"
              >
                <TableCell className="font-medium text-white">
                  <div className="max-w-[150px] truncate" title={account.nome}>
                    {account.nome}
                  </div>
                </TableCell>
                <TableCell>
                  {getPlatformBadge(account.plataforma || "TikTok")}
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="max-w-[120px] truncate" title={displayNicho(account)}>
                    {displayNicho(account)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-white">
                    {account.plataforma === "Shopify" 
                      ? `${formatNumberWithK(account.clientes || 0)} clientes`
                      : `${formatNumberWithK(account.seguidores)} seguidores`
                    }
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-green-400">
                  {formatCurrency(account.preco)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(account.status)}
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="max-w-[100px] truncate" title={account.pais}>
                    {account.pais}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(account)}
                      disabled={isLoading}
                      className="glass-card border-tech-accent/20 text-gray-300 hover:bg-tech-accent/10 hover:text-white hover:border-tech-highlight"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(account.id)}
                      disabled={isLoading}
                      className="glass-card border-red-600/20 text-red-400 hover:bg-red-600/10 hover:text-red-300 hover:border-red-500"
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <p className="text-gray-400">Nenhuma conta cadastrada.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ImprovedAccountsTable;
