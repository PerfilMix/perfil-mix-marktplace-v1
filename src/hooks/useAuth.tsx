
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string;
  is_admin: boolean;
  is_approved_seller?: boolean;
  seller_sales_blocked?: boolean;
}


export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const cleanupAuthState = useCallback(() => {
    console.log('Limpando estado de autenticação...');
    // Remove Supabase auth keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });

  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, profile_image_url, is_admin, is_approved_seller, seller_sales_blocked')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Erro crítico ao buscar perfil:', error);
      return null;
    }
  }, []);


  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('Auth state changed:', event, session?.user?.id);
    setSession(session);
    setUser(session?.user ?? null);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      console.log('Usuário autenticado com sucesso');
      
      if (session?.user?.id) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      }
      setLoading(false);
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('Usuário desconectado');
      setUserProfile(null);
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const getInitialSession = useCallback(async () => {
    try {
      console.log('Verificando sessão existente...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('invalid_token')) {
          console.log('Token inválido detectado, limpando estado...');
          cleanupAuthState();
          if (window.location.pathname !== '/' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            return;
          }
        }
      } else if (session) {
        console.log('Sessão existente encontrada:', session.user?.id);
        setSession(session);
        setUser(session.user);
        
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        console.log('Nenhuma sessão ativa encontrada');
      }
    } catch (error) {
      console.error('Erro crítico ao verificar sessão:', error);
      cleanupAuthState();
    } finally {
      setLoading(false);
    }
  }, [cleanupAuthState, fetchUserProfile]);

  useEffect(() => {
    if (initialized) return;
    
    console.log('Inicializando useAuth...');
    setInitialized(true);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized, handleAuthStateChange, getInitialSession]);

  const signOut = useCallback(async () => {
    try {
      console.log('Iniciando processo de logout...');
      setLoading(true);
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Erro ao fazer logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
      
      setInitialized(false);
      window.location.href = '/';
      
    } catch (error) {
      console.error('Erro crítico no logout:', error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  }, [cleanupAuthState]);

  const getUserInitials = useCallback((name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const isAuthenticated = !!(user && session);

  return {
    user,
    session,
    userProfile,
    loading,
    signOut,
    getUserInitials,
    isAuthenticated
  };
};
