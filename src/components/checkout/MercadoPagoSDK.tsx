
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface MercadoPagoSDKProps {
  publicKey: string;
  onSDKLoaded: (mp: any) => void;
  onError: () => void;
}

const MercadoPagoSDK = ({ publicKey, onSDKLoaded, onError }: MercadoPagoSDKProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [sdkHealth, setSDKHealth] = useState<'loading' | 'healthy' | 'error'>('loading');
  const { toast } = useToast();
  const maxRetries = 3;

  const checkSDKHealth = async (mp: any): Promise<boolean> => {
    try {
      // Try to create a simple test to verify SDK is working
      if (mp && typeof mp.createCardToken === 'function') {
        console.log('[SDK Health] MercadoPago SDK is healthy');
        setSDKHealth('healthy');
        return true;
      }
      throw new Error('SDK methods not available');
    } catch (error) {
      console.error('[SDK Health] SDK health check failed:', error);
      setSDKHealth('error');
      return false;
    }
  };

  const loadSDK = async () => {
    if (!publicKey) {
      console.error('[SDK] No public key provided');
      handleError();
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      console.log(`[SDK] Loading attempt ${retryCount + 1}/${maxRetries + 1}`);

      // Check if SDK is already loaded
      if (window.MercadoPago) {
        console.log('[SDK] MercadoPago SDK already loaded, initializing...');
        const mpInstance = new window.MercadoPago(publicKey);
        
        const isHealthy = await checkSDKHealth(mpInstance);
        if (isHealthy) {
          onSDKLoaded(mpInstance);
          setIsLoading(false);
          return;
        } else {
          throw new Error('SDK health check failed');
        }
      }

      // Load SDK script with enhanced error handling
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      
      document.head.appendChild(script);

      // Wait for script to load with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SDK loading timeout')), 8000)
      );

      await Promise.race([loadPromise, timeoutPromise]);

      // Verify SDK is available and initialize
      if (!window.MercadoPago) {
        throw new Error('MercadoPago SDK not available after loading');
      }

      console.log('[SDK] MercadoPago SDK loaded successfully, initializing...');
      const mpInstance = new window.MercadoPago(publicKey);
      
      const isHealthy = await checkSDKHealth(mpInstance);
      if (isHealthy) {
        onSDKLoaded(mpInstance);
        setIsLoading(false);
        console.log('[SDK] SDK loaded and initialized successfully');
      } else {
        throw new Error('SDK initialization failed health check');
      }

    } catch (error) {
      console.error('[SDK] Error loading MercadoPago SDK:', error);
      handleError();
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setSDKHealth('error');
    
    if (retryCount < maxRetries) {
      const nextRetry = retryCount + 1;
      console.log(`[SDK] Retrying SDK load (${nextRetry}/${maxRetries}) in ${2 * nextRetry}s`);
      
      setTimeout(() => {
        setRetryCount(nextRetry);
        loadSDK();
      }, 2000 * nextRetry); // Progressive backoff
    } else {
      console.error('[SDK] All retry attempts failed');
      toast({
        variant: "destructive",
        title: "Erro no sistema de pagamento",
        description: "Não foi possível carregar o sistema de pagamento. Recarregue a página e tente novamente.",
        duration: 8000
      });
      onError();
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setHasError(false);
    setSDKHealth('loading');
    loadSDK();
  };

  useEffect(() => {
    loadSDK();
  }, [publicKey]);

  if (hasError && retryCount >= maxRetries) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border rounded-lg border-red-300 bg-red-50">
        <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
        <span className="text-red-700 text-center mb-3">
          <strong>Erro ao carregar sistema de pagamento</strong>
          <br />
          Verifique sua conexão e recarregue a página.
        </span>
        <button
          onClick={handleManualRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-tech-highlight mb-2" />
        <span className="text-gray-300 text-center">
          Carregando sistema de pagamento...
          {retryCount > 0 && (
            <span className="block text-sm text-gray-400">
              (tentativa {retryCount + 1}/{maxRetries + 1})
            </span>
          )}
        </span>
        {sdkHealth === 'error' && (
          <span className="text-cyan-400 text-xs mt-1">
            Verificando saúde do sistema...
          </span>
        )}
      </div>
    );
  }

  return null;
};

export default MercadoPagoSDK;
