import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminData {
  email: string;
  name: string;
}

interface AdminAuthState {
  admin: AdminData | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAdminAuth = () => {
  const [authState, setAuthState] = useState<AdminAuthState>({
    admin: null,
    isAuthenticated: false,
    loading: true
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      const adminAuthenticated = localStorage.getItem('adminAuthenticated');

      if (adminAuthenticated === 'true' && adminEmail) {
        // Verificar se o admin ainda existe na base de dados
        const { data, error } = await supabase
          .from('admins')
          .select('email, password')
          .eq('email', adminEmail)
          .maybeSingle();

        if (error || !data) {
          // Admin não existe, limpar localStorage
          localStorage.removeItem('adminEmail');
          localStorage.removeItem('adminAuthenticated');
          setAuthState({
            admin: null,
            isAuthenticated: false,
            loading: false
          });
          return;
        }

        const adminData: AdminData = {
          email: data.email,
          name: 'Administrador'
        };

        setAuthState({
          admin: adminData,
          isAuthenticated: true,
          loading: false
        });
      } else {
        setAuthState({
          admin: null,
          isAuthenticated: false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação do admin:', error);
      setAuthState({
        admin: null,
        isAuthenticated: false,
        loading: false
      });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; admin?: AdminData; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('email, password')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (error || !data) {
        return { 
          success: false, 
          error: 'Credenciais inválidas' 
        };
      }

      const adminData: AdminData = {
        email: data.email,
        name: 'Administrador'
      };

      // Salvar no localStorage
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminAuthenticated', 'true');

      setAuthState({
        admin: adminData,
        isAuthenticated: true,
        loading: false
      });

      return { success: true, admin: adminData };
    } catch (error) {
      console.error('Erro no login do admin:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminAuthenticated');
    
    setAuthState({
      admin: null,
      isAuthenticated: false,
      loading: false
    });
  }, []);

  return {
    admin: authState.admin,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    login,
    logout,
    checkAuthStatus
  };
};