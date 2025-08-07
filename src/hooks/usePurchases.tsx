
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TikTokAccount } from '@/types';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<TikTokAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const convertToTikTokAccount = (rawAccount: any): TikTokAccount => {
    try {
      return {
        ...rawAccount,
        status: rawAccount.status as 'disponivel_venda' | 'em_producao' | 'vendido',
        plataforma: rawAccount.plataforma as 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify',
        tiktok_shop: rawAccount.tiktok_shop as 'Sim' | 'Não',
        engajamento: rawAccount.engajamento as 'Alto' | 'Médio' | 'Baixo'
      };
    } catch (err) {
      console.error("usePurchases - Erro ao converter conta:", err, rawAccount);
      throw err;
    }
  };

  const fetchPurchases = async () => {
    if (!isAuthenticated || !user) {
      console.log("usePurchases - Usuário não autenticado, limpando compras");
      setPurchases([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("usePurchases - Buscando compras do usuário:", user.id);

      const { data, error: queryError } = await supabase
        .from("accounts")
        .select("*")
        .eq("comprada_por", user.id)
        .in("status", ["vendido", "vendida"])
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("usePurchases - Erro na query:", queryError);
        throw queryError;
      }
      
      const purchases = (data || []).map(convertToTikTokAccount);
      setPurchases(purchases);
      console.log(`usePurchases - Encontradas ${purchases.length} compras`);
    } catch (err: any) {
      console.error("usePurchases - Erro ao buscar compras:", err);
      setError("Erro ao carregar suas compras");
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("usePurchases - useEffect disparado:", { 
      hasUser: !!user, 
      isAuthenticated
    });
    
    // Adicionar um pequeno delay para evitar problemas de inicialização
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        fetchPurchases();
      } else if (!isAuthenticated) {
        setPurchases([]);
        setIsLoading(false);
        setError(null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user?.id, isAuthenticated]);

  return {
    purchases,
    isLoading,
    error,
    refetch: fetchPurchases
  };
};
