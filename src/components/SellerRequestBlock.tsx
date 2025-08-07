import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedSellerRequestForm } from './seller/EnhancedSellerRequestForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, AlertCircle } from 'lucide-react';

interface SellerRequestBlockProps {
  userProfile?: any;
  onRequestSubmitted?: () => void;
}

export const SellerRequestBlock: React.FC<SellerRequestBlockProps> = ({ onRequestSubmitted }) => {
  const { user, userProfile } = useAuth();

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Login Necessário</h3>
          <p className="text-muted-foreground">
            Você precisa estar logado para solicitar se tornar um vendedor.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (userProfile?.is_approved_seller) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="text-center py-8">
          <UserCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-green-600">Vendedor Aprovado</h3>
          <p className="text-muted-foreground">
            Você já é um vendedor aprovado em nossa plataforma!
          </p>
        </CardContent>
      </Card>
    );
  }

  return <EnhancedSellerRequestForm onRequestSubmitted={onRequestSubmitted} />;
};