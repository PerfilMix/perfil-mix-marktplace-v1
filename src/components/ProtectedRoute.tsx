
import { useEffect, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ErrorBoundary from './ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Removed debug logging for performance

    if (!isAuthenticated) {
      if (location.pathname.startsWith('/admin')) {
        navigate('/admin-login', { replace: true });
      } else {
        const redirectPath = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${redirectPath}`, { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, location.pathname, location.search, user, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tech-darker">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tech-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default ProtectedRoute;
