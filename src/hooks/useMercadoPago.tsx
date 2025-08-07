
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentData {
  paymentMethodId: string;
  token?: string;
  installments?: number;
  amount: number;
  email: string;
  identificationType: string;
  identificationNumber: string;
  payerName: string;
  accountId: string;
  userId: string;
  issuerId?: string;
}

interface PaymentResponse {
  success: boolean;
  payment?: any;
  payment_id?: string;
  status?: string;
  transaction?: any;
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
  external_reference?: string;
  error?: string;
}

interface PaymentError {
  code: string;
  message: string;
  cause?: string;
  retryable?: boolean;
}

// Enhanced error mappings with more specific messages
const errorMessages: Record<string, string> = {
  // Card validation errors
  'invalid_parameter': 'Dados do cartão inválidos. Verifique as informações inseridas.',
  'card_disabled': 'Cartão desabilitado pelo banco. Entre em contato com o banco emissor.',
  'insufficient_amount': 'Valor insuficiente no cartão.',
  'invalid_card_number': 'Número do cartão inválido. Verifique os 16 dígitos.',
  'invalid_security_code': 'Código de segurança (CVV) inválido.',
  'invalid_expiration_date': 'Data de validade do cartão inválida ou expirada.',
  'card_luhn_check_failed': 'Número do cartão não passou na verificação. Verifique os dígitos.',
  'high_risk': 'Transação negada por medidas de segurança do banco.',
  
  // PIX specific errors - Permitir PIX normalmente
  'pix_not_configured': 'Aguarde. Configurando PIX para sua transação...',
  'pix_configuration_error': 'Aguarde. Configurando PIX para sua transação...',
  '13253': 'Conta PIX sendo configurada. Aguarde alguns segundos e tente novamente.',
  'collector_user_without_key': 'Conta PIX sendo configurada. Aguarde alguns segundos e tente novamente.',
  'mercado_pago_error': 'Erro temporário no PIX. Tente novamente em alguns segundos.',
  
  // Issuer/Bank errors
  'card_authorization_failed': 'Transação negada pelo banco emissor. Tente outro cartão.',
  'insufficient_funds': 'Saldo insuficiente no cartão.',
  'card_expired': 'Cartão vencido. Verifique a data de validade.',
  'card_not_allowed': 'Cartão não aceito para esta transação.',
  'issuer_unavailable': 'Banco emissor temporariamente indisponível.',
  
  // Processing errors (retryable)
  'processing_error': 'Erro temporário no processamento. Tente novamente em alguns segundos.',
  'timeout': 'Tempo limite excedido. Verifique sua conexão e tente novamente.',
  'network_error': 'Erro de conexão. Verifique sua internet.',
  'server_error': 'Erro interno do servidor. Tente novamente.',
  
  // Token/SDK errors
  'token_creation_failed': 'Erro ao processar dados do cartão. Verifique as informações.',
  'sdk_not_loaded': 'Sistema de pagamento não carregado. Recarregue a página.',
  'invalid_token': 'Token do cartão inválido. Tente inserir os dados novamente.',
  
  // Default
  'unknown_error': 'Erro desconhecido. Entre em contato com o suporte.'
};

// List of retryable error codes - Incluir erros do PIX
const retryableErrors = [
  'processing_error',
  'timeout', 
  'network_error',
  'server_error',
  'issuer_unavailable',
  'pix_not_configured',
  'collector_user_without_key',
  '13253',
  'pix_configuration_error'
];

export const useMercadoPago = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<PaymentError | null>(null);
  const [debugMode] = useState(process.env.NODE_ENV === 'development');
  const { toast } = useToast();

  const debugLog = (message: string, data?: any) => {
    if (debugMode) {
      console.log(`[MercadoPago Debug] ${message}`, data || '');
    }
  };

  const getErrorMessage = (error: any): PaymentError => {
    debugLog('Processing error details:', error);
    
    let errorCode = 'unknown_error';
    let errorMessage = 'Erro desconhecido no pagamento';
    let retryable = false;

    // Handle string errors
    if (typeof error === 'string') {
      errorCode = error;
      errorMessage = errorMessages[error] || error;
      retryable = retryableErrors.includes(error);
    }
    // Handle API response errors with cause array
    else if (error?.cause && Array.isArray(error.cause) && error.cause.length > 0) {
      const cause = error.cause[0];
      errorCode = cause.code || 'api_error';
      errorMessage = errorMessages[cause.code] || cause.description || 'Erro na validação do pagamento';
      retryable = retryableErrors.includes(cause.code);
    }
    // Handle direct error objects
    else if (error?.code) {
      errorCode = error.code;
      errorMessage = errorMessages[error.code] || error.message || 'Erro no processamento';
      retryable = retryableErrors.includes(error.code);
    }
    // Handle error messages with pattern matching
    else if (error?.message) {
      const message = error.message.toLowerCase();
      
      // Check for PIX specific errors first - Tornar PIX sempre disponível
      if (message.includes('pix temporariamente indisponível') || 
          message.includes('collector user without key enabled') ||
          message.includes('key enabled for qr render') ||
          message.includes('collector user without key') ||
          message.includes('qr rendernull')) {
        errorCode = 'collector_user_without_key';
        errorMessage = 'Conta PIX sendo configurada. Aguarde alguns segundos e tente novamente.';
        retryable = true; // Tornar retryable para tentar novamente
      } else if (message.includes('card_number') || message.includes('número')) {
        errorCode = 'invalid_card_number';
        errorMessage = 'Número do cartão inválido. Verifique os 16 dígitos.';
      } else if (message.includes('security_code') || message.includes('cvv')) {
        errorCode = 'invalid_security_code';
        errorMessage = 'Código de segurança (CVV) inválido.';
      } else if (message.includes('expiration') || message.includes('validade')) {
        errorCode = 'invalid_expiration_date';
        errorMessage = 'Data de validade inválida ou cartão vencido.';
      } else if (message.includes('cardholder') || message.includes('titular')) {
        errorCode = 'invalid_parameter';
        errorMessage = 'Nome do titular inválido. Use apenas letras.';
      } else if (message.includes('identification') || message.includes('cpf')) {
        errorCode = 'invalid_parameter';
        errorMessage = 'CPF inválido. Verifique os 11 dígitos.';
      } else if (message.includes('network') || message.includes('timeout')) {
        errorCode = 'network_error';
        errorMessage = 'Erro de conexão. Verifique sua internet.';
        retryable = true;
      } else if (message.includes('token')) {
        errorCode = 'token_creation_failed';
        errorMessage = 'Erro ao processar dados do cartão. Tente novamente.';
        retryable = true;
      } else {
        errorMessage = error.message;
        retryable = message.includes('temporário') || message.includes('tente novamente');
      }
    }

    debugLog('Processed error:', { errorCode, errorMessage, retryable });

    return {
      code: errorCode,
      message: errorMessage,
      retryable,
      cause: error?.cause
    };
  };

  const processPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
    setIsProcessing(true);
    setLastError(null);
    debugLog('Starting payment process:', { ...paymentData, token: paymentData.token ? '***' : undefined });

    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        debugLog(`Payment attempt ${attempt + 1}/${maxRetries + 1}`);

        const requestBody = {
          payment_method_id: paymentData.paymentMethodId,
          token: paymentData.token,
          installments: paymentData.installments,
          amount: paymentData.amount,
          email: paymentData.email,
          identification_type: paymentData.identificationType,
          identification_number: paymentData.identificationNumber,
          payer_name: paymentData.payerName,
          account_id: paymentData.accountId,
          user_id: paymentData.userId,
          issuer_id: paymentData.issuerId
        };

        debugLog('Sending payment request to backend:', requestBody);

        // Use specific PIX function for PIX payments to ensure better compatibility
        const functionName = paymentData.paymentMethodId === 'pix' 
          ? 'mercado-pago-pix' 
          : 'mercado-pago-payment';
        
        debugLog(`Using edge function: ${functionName}`);

        const { data, error } = await supabase.functions.invoke(functionName, {
          body: requestBody
        });

        if (error) {
          debugLog('Supabase function error:', error);
          throw new Error(`Erro na comunicação: ${error.message}`);
        }

        debugLog('Backend response received:', data);

        if (!data.success) {
          const paymentError = getErrorMessage({
            code: data.error_code || 'payment_failed',
            message: data.error || 'Erro no pagamento',
            cause: data.error_cause
          });
          
          // Check if error is retryable and we haven't exceeded max retries
          if (paymentError.retryable && attempt < maxRetries) {
            debugLog(`Retryable error detected, attempt ${attempt + 1}, retrying...`);
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Progressive delay
            continue;
          }
          
          throw paymentError;
        }

        debugLog('Payment processed successfully:', data);
        setIsProcessing(false);
        
        // Return the data with proper structure for PIX payments
        return {
          success: true,
          payment_id: data.payment_id,
          status: data.status,
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64,
          ticket_url: data.ticket_url,
          transaction: { id: data.transaction_id },
          external_reference: data.external_reference
        };

      } catch (error) {
        debugLog('Payment processing error:', error);
        
        if (attempt === maxRetries) {
          const processedError = getErrorMessage(error);
          
          setLastError(processedError);
          
          toast({
            variant: "destructive",
            title: "Erro no pagamento",
            description: processedError.message,
            duration: 6000
          });
          
          setIsProcessing(false);
          return {
            success: false,
            error: processedError.message
          };
        }
        
        // Retry for retryable errors
        const processedError = getErrorMessage(error);
        if (processedError.retryable) {
          debugLog(`Retrying due to retryable error: ${processedError.code}`);
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          // Non-retryable error, fail immediately
          setLastError(processedError);
          toast({
            variant: "destructive",
            title: "Erro no pagamento",
            description: processedError.message,
            duration: 6000
          });
          
          setIsProcessing(false);
          return {
            success: false,
            error: processedError.message
          };
        }
      }
    }

    setIsProcessing(false);
    return {
      success: false,
      error: 'Erro após múltiplas tentativas'
    };
  };

  const retryLastPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
    if (!lastError) {
      return { success: false, error: 'Nenhum pagamento para retentar' };
    }
    
    debugLog('Retrying last payment with error:', lastError);
    return processPayment(paymentData);
  };

  return {
    processPayment,
    retryLastPayment,
    isProcessing,
    lastError,
    clearError: () => setLastError(null)
  };
};
