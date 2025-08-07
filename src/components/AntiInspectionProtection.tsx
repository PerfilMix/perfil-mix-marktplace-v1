
import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

interface AntiInspectionProtectionProps {
  level?: 'light' | 'medium' | 'strict';
  showToast?: boolean;
}

const AntiInspectionProtection = ({ level = 'medium', showToast = true }: AntiInspectionProtectionProps) => {
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile (telas menores que 768px)
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar inicialmente
    checkIsMobile();

    // Adicionar listener para mudanças de tamanho da tela
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    // Se for mobile, não aplicar proteção
    if (isMobile) {
      return;
    }

    // Bloquear clique direito (context menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleSecurityViolation('Context Menu');
      return false;
    };

    // Detectar atalhos de desenvolvedor
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        handleSecurityViolation('F12 Key');
        return false;
      }

      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        handleSecurityViolation('Ctrl+Shift+I');
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        handleSecurityViolation('Ctrl+U');
        return false;
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleSecurityViolation('Ctrl+Shift+C');
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        handleSecurityViolation('Ctrl+Shift+J');
        return false;
      }
    };

    const handleSecurityViolation = (method: string) => {
      console.warn(`🛡️ Tentativa de inspeção detectada: ${method} - ${new Date().toISOString()}`);
      
      setAlertCount(prev => prev + 1);

      if (level === 'light') {
        if (showToast) {
          toast.warning('Sistema protegido contra inspeção', {
            description: 'Esta ação não é permitida.',
            duration: 3000,
          });
        }
      } else if (level === 'medium') {
        if (showToast) {
          toast.error('🛡️ Tentativa de inspeção detectada', {
            description: 'O sistema está protegido contra inspeção.',
            duration: 4000,
          });
        }
        
        // Mostrar modal após 2 tentativas
        if (alertCount >= 1) {
          setShowSecurityAlert(true);
        }
      } else if (level === 'strict') {
        setShowSecurityAlert(true);
        if (showToast) {
          toast.error('🚨 ACESSO NEGADO', {
            description: 'Tentativa de inspeção registrada no sistema.',
            duration: 5000,
          });
        }
      }
    };

    // Adicionar event listeners apenas se não for mobile
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Detectar se DevTools está aberto (método adicional) - apenas no modo strict
    let devToolsInterval: NodeJS.Timeout | null = null;
    if (level === 'strict') {
      const detectDevTools = () => {
        // Aumentar threshold e adicionar verificações mais robustas
        const threshold = 300;
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        
        // Só detectar se ambas as dimensões indicarem DevTools aberto
        // e se a diferença for significativa
        if (heightDiff > threshold && widthDiff > 50) {
          handleSecurityViolation('DevTools Detection');
        }
      };
      
      // Reduzir frequência de verificação
      devToolsInterval = setInterval(detectDevTools, 5000);
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      if (devToolsInterval) {
        clearInterval(devToolsInterval);
      }
    };
  }, [level, showToast, alertCount, isMobile]);

  // Se for mobile, não renderizar o modal de proteção
  if (isMobile) {
    return null;
  }

  return (
    <AlertDialog open={showSecurityAlert} onOpenChange={setShowSecurityAlert}>
      <AlertDialogContent className="bg-tech-card border-red-500/50 max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-red-400" />
          </div>
          <AlertDialogTitle className="text-red-400 text-lg">
            🛡️ Sistema Protegido
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 text-center">
            A tentativa de inspeção foi <strong>detectada e registrada</strong> em nossos sistemas de segurança.
            <br /><br />
            Este conteúdo está protegido contra cópia e engenharia reversa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="justify-center">
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700 text-white px-6"
            onClick={() => setShowSecurityAlert(false)}
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AntiInspectionProtection;
