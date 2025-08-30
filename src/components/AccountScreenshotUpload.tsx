import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { accounts } from "../data/accounts";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const account = accounts.find(acc => acc.id === id);
  
  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Conta não encontrada</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        onClick={() => navigate("/")} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {account.image && (
            <div className="mb-6">
              <img 
                src={account.image} 
                alt={`Screenshot da conta ${account.username}`}
                className="w-full rounded-lg border border-border"
                onError={(e) => {
                  console.error(`Erro ao carregar imagem: ${account.image}`);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log(`Imagem carregada com sucesso: ${account.image}`);
                }}
              />
            </div>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {account.username}
                <Badge variant="secondary">{account.platform}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">País:</p>
                  <Badge variant="outline" className="mt-1">{account.country}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seguidores:</p>
                  <p className="font-bold text-lg">{account.followers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nicho:</p>
                  <Badge variant="outline" className="mt-1">{account.niche}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monetizada:</p>
                  <p className="font-medium">{account.monetized ? "Sim" : "Não"}</p>
                </div>
              </div>
              
              {account.platform === "TikTok" && (
                <div>
                  <p className="text-sm text-muted-foreground">TikTok Shop:</p>
                  <p className="font-medium">{account.tiktokShop ? "Sim" : "Não"}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-border">
                <p className="text-2xl font-bold text-primary mb-4">
                  Comprar {account.price}
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Comprar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
