import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TikTokAccount } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/helpers";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, Shield, ArrowLeft, HelpCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMercadoPago } from "@/hooks/useMercadoPago";
import { useDebounce } from "@/hooks/useDebounce";
import PixPayment from "@/components/PixPayment";
import EmailValidation from "@/components/checkout/EmailValidation";
import OrderSummary from "@/components/checkout/OrderSummary";
import MercadoPagoSDK from "@/components/checkout/MercadoPagoSDK";
import { 
  detectCardBrand, 
  formatCardNumber, 
  validateCardNumber, 
  validateCVV, 
  validateExpirationDate,
  validateCPF,
  validatePayerName,
  getCardBrandIcon 
} from "@/components/checkout/CardValidation";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const PaymentMethodSelection = ({
  paymentMethodsEnabled,
  formData,
  handleInputChange
}: {
  paymentMethodsEnabled: { pix: boolean; card: boolean };
  formData: { paymentMethod: 'cartao' | 'pix' };
  handleInputChange: (field: string, value: string) => void;
}) => {
  const { pix: pixEnabled, card: cardEnabled } = paymentMethodsEnabled;

  if (!pixEnabled && !cardEnabled) {
    return (
      <div className="p-4 border rounded-lg border-red-300 bg-red-50">
        <p className="text-red-700 font-medium">
          Nenhum método de pagamento está disponível no momento. Entre em contato com o suporte.
        </p>
      </div>
    );
  }

  if (pixEnabled && !cardEnabled) {
    return (
      <div className="p-4 border rounded-lg border-green-300 bg-green-50">
        <div className="flex items-center space-x-2">
          <img 
            src="https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/icone%20pix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaWNvbmUgcGl4LnBuZyIsImlhdCI6MTc1MTE2NDYxOCwiZXhwIjoyMDY2NTI0NjE4fQ.NiFN0Ka9AL4PF3Q8a_SO4Mn2bQRbgF5MVYgIKq3NjpE" 
            alt="PIX" 
            className="h-5 w-5" 
          />
          <span className="text-gray-800 font-medium">Pagamento via PIX</span>
        </div>
      </div>
    );
  }

  if (!pixEnabled && cardEnabled) {
    return (
      <div className="p-4 border rounded-lg border-blue-300 bg-blue-50">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="text-gray-800 font-medium">Pagamento via Cartão</span>
        </div>
      </div>
    );
  }

  // Both methods enabled, show selection buttons
  return (
    <div className="flex space-x-4">
      <button
        type="button"
        onClick={() => handleInputChange('paymentMethod', 'cartao')}
        className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
          formData.paymentMethod === 'cartao'
            ? 'border-tech-highlight bg-tech-highlight/10 text-tech-highlight'
            : 'border-tech-accent/30 hover:border-tech-accent text-gray-300'
        }`}
      >
        <CreditCard className="h-5 w-5" />
        <span>Cartão</span>
      </button>
      <button
        type="button"
        onClick={() => handleInputChange('paymentMethod', 'pix')}
        className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
          formData.paymentMethod === 'pix'
            ? 'border-tech-highlight bg-tech-highlight/10 text-tech-highlight'
            : 'border-tech-accent/30 hover:border-tech-accent text-gray-300'
        }`}
      >
        <img 
          src="https://vgmvcdccjpnjqbychrmi.supabase.co/storage/v1/object/sign/images/icone%20pix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNTc2N2E1Mi01MThkLTQxYzEtYjZhOC0xZWMyN2EzMjZmNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaWNvbmUgcGl4LnBuZyIsImlhdCI6MTc1MTE2NDYxOCwiZXhwIjoyMDY2NTI0NjE4fQ.NiFN0Ka9AL4PF3Q8a_SO4Mn2bQRbgF5MVYgIKq3NjpE" 
          alt="PIX" 
          className="h-5 w-5" 
          style={{ filter: formData.paymentMethod === 'pix' ? 'brightness(1.2)' : 'none' }}
        />
        <span>PIX</span>
      </button>
    </div>
  );
};

const CardForm = ({
  formData,
  handleInputChange,
  paymentMethodsEnabled,
  account,
  getCardBrandIcon,
  generateMonthOptions,
  generateYearOptions,
  generateInstallmentOptions
}: {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  paymentMethodsEnabled: { pix: boolean; card: boolean };
  account: TikTokAccount | null;
  getCardBrandIcon: (cardNumber: string) => string;
  generateMonthOptions: () => { value: string; label: string }[];
  generateYearOptions: () => { value: string; label: string }[];
  generateInstallmentOptions: () => { value: string; label: string }[];
}) => {
  if (!paymentMethodsEnabled.card || formData.paymentMethod !== 'cartao') return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-tech-darker border-tech-accent/20">
      <div>
        <Label htmlFor="cardNumber" className="text-gray-300 flex items-center space-x-2">
          <span>Número do cartão *</span>
          {formData.cardNumber && (
            <span className="text-lg">{getCardBrandIcon(formData.cardNumber)}</span>
          )}
        </Label>
        <Input
          id="cardNumber"
          type="text"
          value={formData.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
          placeholder="0000 0000 0000 0000"
          maxLength={23}
          className="mt-1 bg-tech-card border-tech-accent/30 text-white placeholder:text-gray-500"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cardMonth" className="text-gray-300">Mês *</Label>
          <Select value={formData.cardMonth} onValueChange={(value) => handleInputChange('cardMonth', value)}>
            <SelectTrigger className="mt-1 bg-tech-card border-tech-accent/30 text-white">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent className="bg-tech-card border-tech-accent/30 text-white z-50">
              {generateMonthOptions().map((month) => (
                <SelectItem key={month.value} value={month.value} className="text-white hover:bg-tech-accent/20">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cardYear" className="text-gray-300">Ano *</Label>
          <Select value={formData.cardYear} onValueChange={(value) => handleInputChange('cardYear', value)}>
            <SelectTrigger className="mt-1 bg-tech-card border-tech-accent/30 text-white">
              <SelectValue placeholder="AAAA" />
            </SelectTrigger>
            <SelectContent className="bg-tech-card border-tech-accent/30 text-white z-50">
              {generateYearOptions().map((year) => (
                <SelectItem key={year.value} value={year.value} className="text-white hover:bg-tech-accent/20">
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <Label htmlFor="cardCvv" className="text-gray-300">CVV *</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-tech-darker border-tech-accent/30 text-white">
                <p>Código de segurança de 3 ou 4 dígitos</p>
                <p>localizado no verso do cartão</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="cardCvv"
            type="text"
            value={formData.cardCvv}
            onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, ''))}
            placeholder="000"
            maxLength={4}
            className="mt-1 bg-tech-card border-tech-accent/30 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {account && (
        <div>
          <Label htmlFor="installments" className="text-gray-300">Parcelamento</Label>
          <Select value={formData.installments} onValueChange={(value) => handleInputChange('installments', value)}>
            <SelectTrigger className="mt-1 bg-tech-card border-tech-accent/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-tech-card border-tech-accent/30 text-white z-50">
              {generateInstallmentOptions().map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-tech-accent/20">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

const PixInfo = ({
  paymentMethodsEnabled,
  formData,
  account
}: {
  paymentMethodsEnabled: { pix: boolean; card: boolean };
  formData: { paymentMethod: 'cartao' | 'pix' };
  account: TikTokAccount | null;
}) => {
  if (!paymentMethodsEnabled.pix || formData.paymentMethod !== 'pix' || !account) return null;

  return (
    <div className="p-4 border rounded-lg border-green-300 bg-green-50">
      <h4 className="font-semibold text-gray-800 mb-3">Informações sobre o pagamento via PIX:</h4>
      <div className="space-y-2 text-gray-700">
        <p>
          <span className="text-gray-600">Valor à vista:</span>{' '}
          <strong className="text-gray-800">{formatCurrency(account.preco)}</strong>
        </p>
        <p className="font-medium text-green-700">• Liberação imediata!</p>
        <p>• É simples, só usar o aplicativo de seu banco para pagar PIX.</p>
        <p>• Super seguro. O pagamento PIX foi desenvolvido pelo Banco Central para facilitar pagamentos.</p>
      </div>
    </div>
  );
};

const PersonalInfoSection = ({
  formData,
  handleInputChange,
  user,
  isEmailValid,
  setIsEmailValid
}: {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  user: any;
  isEmailValid: boolean;
  setIsEmailValid: (valid: boolean) => void;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">Dados Pessoais</h3>
      
      <div>
        <Label htmlFor="nome" className="text-gray-300">Nome completo *</Label>
        <Input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          placeholder="Seu nome completo"
          className="mt-1 bg-tech-darker border-tech-accent/30 text-white placeholder:text-gray-500"
        />
      </div>

      <EmailValidation
        email={formData.email}
        userEmail={user?.email || ''}
        onEmailChange={(email) => handleInputChange('email', email)}
        onValidationChange={setIsEmailValid}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpfCnpj" className="text-gray-300">CPF *</Label>
          <Input
            id="cpfCnpj"
            type="text"
            value={formData.cpfCnpj}
            onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
            className="mt-1 bg-tech-darker border-tech-accent/30 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="telefone" className="text-gray-300">Telefone *</Label>
          <Input
            id="telefone"
            type="text"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            placeholder="+55 (11) 99999-9999"
            maxLength={19}
            className="mt-1 bg-tech-darker border-tech-accent/30 text-white placeholder:text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<TikTokAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [pixData, setPixData] = useState<{
    qr_code?: string;
    qr_code_base64?: string;
    transaction_id?: string;
  }>({});

  // Payment method visibility settings
  const [paymentMethodsEnabled, setPaymentMethodsEnabled] = useState({
    pix: true,
    card: true
  });
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpfCnpj: '',
    telefone: '+55 ',
    paymentMethod: 'cartao' as 'cartao' | 'pix',
    cardNumber: '',
    cardMonth: '',
    cardYear: '',
    cardCvv: '',
    installments: '1'
  });

  // Email validation state
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Mercado Pago SDK state
  const [mp, setMp] = useState<any>(null);
  const [cardToken, setCardToken] = useState<string>('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [issuerId, setIssuerId] = useState<string>('');
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [mpPublicKey, setMpPublicKey] = useState<string>('');
  const [sdkError, setSDKError] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { processPayment, retryLastPayment, isProcessing, lastError, clearError } = useMercadoPago();

  // Debounced values for validation
  const debouncedCardNumber = useDebounce(formData.cardNumber, 300);
  const debouncedCardCvv = useDebounce(formData.cardCvv, 300);

  // Get Mercado Pago public key from Supabase Secrets
  useEffect(() => {
    const getMpPublicKey = async () => {
      try {
        console.log('Fetching Mercado Pago public key from Supabase...');
        const { data, error } = await supabase.functions.invoke('get-mp-public-key');
        if (error) {
          console.error('Error fetching MP public key:', error);
          setMpPublicKey('TEST-f2545405-2ff8-4be0-88e1-39ed4d6b6a08');
          return;
        }
        if (data?.publicKey) {
          console.log('MP public key retrieved successfully');
          setMpPublicKey(data.publicKey);
        } else {
          console.warn('No public key found, using fallback');
          setMpPublicKey('TEST-f2545405-2ff8-4be0-88e1-39ed4d6b6a08');
        }
      } catch (error) {
        console.error('Error getting MP public key:', error);
        setMpPublicKey('TEST-f2545405-2ff8-4be0-88e1-39ed4d6b6a08');
      }
    };
    getMpPublicKey();
  }, []);

  // Handle SDK loaded
  const handleSDKLoaded = (mpInstance: any) => {
    setMp(mpInstance);
    setSDKError(false);
    console.log('Mercado Pago SDK loaded and ready');
  };

  const handleSDKError = () => {
    setSDKError(true);
    setMp(null);
  };

  // Format CPF function
  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  // Format phone function
  const formatPhone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.startsWith('55')) {
      const phoneNumber = cleanValue.substring(2);
      if (phoneNumber.length <= 11) {
        return '+55 ' + phoneNumber
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
      }
    }
    return value;
  };

  // Generate month options (01-12)
  const generateMonthOptions = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const month = i.toString().padStart(2, '0');
      months.push({ value: month, label: month });
    }
    return months;
  };

  // Generate year options (current year + 26 years)
  const generateYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 26; i++) {
      const year = i.toString();
      years.push({ value: year, label: year });
    }
    return years;
  };

  // CPF validation
  const validateCPFNumber = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf[i]) * (10 - i);
    }
    let remainder = sum * 10 % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf[i]) * (11 - i);
    }
    remainder = sum * 10 % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleanCpf[10]);
  };

  // Real-time card validation
  useEffect(() => {
    if (debouncedCardNumber && formData.paymentMethod === 'cartao') {
      const isValid = validateCardNumber(debouncedCardNumber);
      const brand = detectCardBrand(debouncedCardNumber);
      
      if (brand && isValid) {
        console.log('Valid card detected:', brand.name);
      }
    }
  }, [debouncedCardNumber, formData.paymentMethod]);

  // Real-time CVV validation
  useEffect(() => {
    if (debouncedCardCvv && debouncedCardNumber && formData.paymentMethod === 'cartao') {
      const isValid = validateCVV(debouncedCardCvv, debouncedCardNumber);
      if (!isValid) {
        const brand = detectCardBrand(debouncedCardNumber);
        const expectedLength = brand?.cvvLength || 3;
        console.log(`CVV should be ${expectedLength} digits for this card`);
      }
    }
  }, [debouncedCardCvv, debouncedCardNumber, formData.paymentMethod]);

  // Load saved checkout data for authenticated user
  const loadCheckoutData = async () => {
    if (!isAuthenticated || !user) return;
    try {
      console.log('Loading checkout data for user:', user.id);
      const { data, error } = await supabase
        .from('checkout_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading checkout data:', error);
        return;
      }

      if (data) {
        console.log('Checkout data loaded successfully');
        setFormData(prev => ({
          ...prev,
          nome: data.nome_completo,
          email: data.email,
          cpfCnpj: data.cpf_cnpj,
          telefone: data.telefone
        }));
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
    }
  };

  // Save checkout data to database
  const saveCheckoutData = async () => {
    if (!isAuthenticated || !user) return;
    try {
      console.log('Saving checkout data for user:', user.id);
      const checkoutData = {
        user_id: user.id,
        nome_completo: formData.nome,
        email: formData.email,
        email_confirmacao: formData.email,
        cpf_cnpj: formData.cpfCnpj,
        telefone: formData.telefone
      };

      const { error } = await supabase
        .from('checkout_data')
        .upsert(checkoutData, { onConflict: 'user_id', ignoreDuplicates: false });

      if (error) {
        console.error('Error saving checkout data:', error);
        throw error;
      }
      console.log('Checkout data saved successfully');
    } catch (error) {
      console.error('Error saving checkout data:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar dados",
        description: "Não foi possível salvar os dados do checkout."
      });
    }
  };

  // Fetch account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', id)
          .eq('status', 'disponivel_venda')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setAccount(data as TikTokAccount);
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Conta não encontrada ou não disponível."
          });
          navigate("/");
        }
      } catch (error) {
        console.error('Error fetching account:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os detalhes da conta."
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccountDetails();
  }, [id, navigate, toast]);

  // Load checkout data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCheckoutData();
    }
  }, [isAuthenticated, user]);

  // Load payment method settings
  useEffect(() => {
    const fetchPaymentMethodSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("type", "payment")
          .in("key", ["payment_method_pix", "payment_method_card"]);

        if (error) throw error;

        let pixEnabled = true;
        let cardEnabled = true;

        data?.forEach(setting => {
          if (setting.key === "payment_method_pix") {
            pixEnabled = setting.value === "true";
          } else if (setting.key === "payment_method_card") {
            cardEnabled = setting.value === "true";
          }
        });

        setPaymentMethodsEnabled({ pix: pixEnabled, card: cardEnabled });

        if (pixEnabled && !cardEnabled) {
          setFormData(prev => ({ ...prev, paymentMethod: 'pix' }));
        } else if (!pixEnabled && cardEnabled) {
          setFormData(prev => ({ ...prev, paymentMethod: 'cartao' }));
        }
      } catch (error) {
        console.error("Error fetching payment method settings:", error);
      } finally {
        setPaymentMethodsLoading(false);
      }
    };
    fetchPaymentMethodSettings();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    console.log(`Input changed: ${field} = ${value}`);
    
    let formattedValue = value;
    
    // Apply formatting for CPF and phone
    if (field === 'cpfCnpj') {
      formattedValue = formatCPF(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    } else if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Reset card token when card data changes
    if (['cardNumber', 'cardMonth', 'cardYear', 'cardCvv'].includes(field)) {
      console.log('Card data changed, resetting tokens');
      setCardToken('');
      setPaymentMethodId('');
      setIssuerId('');
      clearError();
    }
  };

  // Enhanced card validation
  const validateCardFormData = () => {
    console.log('Validating card data with enhanced validation');
    
    if (!formData.cardNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Número do cartão é obrigatório"
      });
      return false;
    }

    if (!validateCardNumber(formData.cardNumber)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Número do cartão inválido"
      });
      return false;
    }

    if (!validateExpirationDate(formData.cardMonth, formData.cardYear)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Data de validade inválida"
      });
      return false;
    }

    if (!validateCVV(formData.cardCvv, formData.cardNumber)) {
      const brand = detectCardBrand(formData.cardNumber);
      const expectedLength = brand?.cvvLength || 3;
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Código de segurança deve ter ${expectedLength} dígitos`
      });
      return false;
    }

    if (!validateCPF(formData.cpfCnpj)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "CPF inválido"
      });
      return false;
    }

    console.log('Enhanced card validation passed');
    return true;
  };

  // Enhanced card token creation with detailed logging and validation
  const validateAndCreateCardToken = async (): Promise<boolean> => {
    if (!mp) {
      console.error('[Token] Mercado Pago SDK not loaded');
      toast({
        variant: "destructive",
        title: "Erro no sistema",
        description: "Sistema de pagamento não carregado. Recarregue a página e tente novamente."
      });
      return false;
    }

    console.log('[Token] Starting enhanced card validation process');
    
    // Enhanced card data validation
    if (!validateCardFormData()) {
      return false;
    }

    setIsCreatingToken(true);

    try {
      const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
      const cleanCpf = formData.cpfCnpj.replace(/\D/g, '');
      const cleanName = formData.nome.trim().replace(/\s+/g, ' ');

      console.log('[Token] Validation passed, creating token with data:', {
        cardNumber: cleanCardNumber.substring(0, 4) + '****',
        cardholderName: cleanName,
        month: formData.cardMonth,
        year: formData.cardYear,
        cvv: '***',
        cpf: cleanCpf.substring(0, 3) + '***'
      });

      const cardData = {
        cardNumber: cleanCardNumber,
        cardholderName: cleanName,
        cardExpirationMonth: formData.cardMonth,
        cardExpirationYear: formData.cardYear,
        securityCode: formData.cardCvv,
        identificationType: 'CPF',
        identificationNumber: cleanCpf
      };

      console.log('[Token] Calling MercadoPago createCardToken...');
      
      // Add timeout to token creation
      const tokenPromise = mp.createCardToken(cardData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token creation timeout')), 15000)
      );

      const response = await Promise.race([tokenPromise, timeoutPromise]);
      
      console.log('[Token] MercadoPago response received:', {
        hasId: !!response?.id,
        hasPaymentMethodId: !!response?.payment_method_id,
        hasIssuerId: !!response?.issuer_id,
        hasError: !!response?.error,
        errorType: response?.error?.type,
        errorMessage: response?.error?.message
      });

      if (!response || response.error) {
        let errorMessage = "Erro ao validar dados do cartão";
        
        if (response?.error) {
          const error = response.error;
          console.error('[Token] Token creation error details:', error);
          
          if (error.message) {
            errorMessage = error.message;
          } else if (error.cause && error.cause.length > 0) {
            const cause = error.cause[0];
            errorMessage = cause.description || cause.code || "Erro na validação dos dados";
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!response.id) {
        console.error('[Token] No token ID in response:', response);
        throw new Error('Token não foi gerado - resposta inválida do servidor');
      }

      console.log('[Token] Token created successfully:', {
        token: response.id,
        payment_method_id: response.payment_method_id,
        issuer_id: response.issuer_id,
        first_six_digits: response.first_six_digits,
        last_four_digits: response.last_four_digits
      });

      setCardToken(response.id);
      setPaymentMethodId(response.payment_method_id);
      setIssuerId(response.issuer_id);
      
      return true;

    } catch (error) {
      console.error('[Token] Enhanced token creation failed:', error);
      
      let errorMessage = "Erro ao validar cartão. Verifique os dados e tente novamente.";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('timeout')) {
          errorMessage = "Tempo limite excedido. Verifique sua conexão e tente novamente.";
        } else if (errorMsg.includes('card_number') || errorMsg.includes('número')) {
          errorMessage = "Número do cartão inválido. Verifique os 16 dígitos.";
        } else if (errorMsg.includes('security_code') || errorMsg.includes('cvv')) {
          errorMessage = "Código de segurança (CVV) inválido.";
        } else if (errorMsg.includes('expiration') || errorMsg.includes('validade')) {
          errorMessage = "Data de validade inválida ou cartão vencido.";
        } else if (errorMsg.includes('cardholder') || errorMsg.includes('titular')) {
          errorMessage = "Nome do titular inválido. Use apenas letras e espaços.";
        } else if (errorMsg.includes('identification') || errorMsg.includes('cpf')) {
          errorMessage = "CPF inválido. Verifique os 11 dígitos.";
        } else if (errorMsg.includes('network') || errorMsg.includes('conexão')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message.length > 10) {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Erro na validação do cartão",
        description: errorMessage,
        duration: 6000
      });
      
      return false;
    } finally {
      setIsCreatingToken(false);
    }
  };

  // Form validation
  const validateFormFields = () => {
    if (!formData.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome é obrigatório"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Email é obrigatório"
      });
      return false;
    }

    if (!isEmailValid) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Email inválido"
      });
      return false;
    }

    if (!formData.cpfCnpj.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "CPF é obrigatório"
      });
      return false;
    }

    if (!validateCPFNumber(formData.cpfCnpj)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "CPF inválido"
      });
      return false;
    }

    if (!formData.telefone.trim() || formData.telefone === '+55 ') {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Telefone é obrigatório"
      });
      return false;
    }

    return true;
  };

  // Enhanced form submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Submit] Form submission started');
    
    if (!validateFormFields() || !account || !user) {
      console.log('[Submit] Form validation failed or missing data');
      return;
    }

    await saveCheckoutData();

    try {
      let paymentData: any = {
        paymentMethodId: formData.paymentMethod === 'pix' ? 'pix' : '',
        amount: account.preco,
        email: formData.email,
        identificationType: 'CPF',
        identificationNumber: formData.cpfCnpj.replace(/\D/g, ''),
        payerName: formData.nome.trim().replace(/\s+/g, ' '),
        accountId: account.id,
        userId: user.id,
        installments: parseInt(formData.installments)
      };

      if (formData.paymentMethod === 'cartao') {
        console.log('[Submit] Processing credit card payment with enhanced validation');

        if (sdkError) {
          toast({
            variant: "destructive",
            title: "Erro no sistema de pagamento",
            description: "Sistema de pagamento não disponível. Recarregue a página e tente novamente."
          });
          return;
        }

        const tokenCreated = await validateAndCreateCardToken();
        if (!tokenCreated) {
          console.log('[Submit] Failed to create card token');
          return;
        }

        if (!cardToken || !paymentMethodId || !issuerId) {
          console.error('[Submit] Missing required card data after token creation');
          toast({
            variant: "destructive",
            title: "Erro interno",
            description: "Erro interno na validação do cartão. Recarregue a página e tente novamente."
          });
          return;
        }

        paymentData.token = cardToken;
        paymentData.paymentMethodId = paymentMethodId;
        paymentData.issuerId = issuerId;
      } else {
        console.log('[Submit] Processing PIX payment');
        paymentData.paymentMethodId = 'pix';
      }

      console.log('[Submit] Submitting payment to enhanced backend');
      const result = await processPayment(paymentData);

      if (result.success) {
        console.log('[Submit] Payment processed successfully');
        if (formData.paymentMethod === 'pix') {
          setPixData({
            qr_code: result.qr_code,
            qr_code_base64: result.qr_code_base64,
            transaction_id: result.transaction?.id
          });
          setShowPixPayment(true);
        } else {
          toast({
            title: "Pagamento aprovado!",
            description: "Sua compra foi realizada com sucesso."
          });
          navigate(`/payment-success?account_id=${account.id}`);
        }
      } else {
        console.log('[Submit] Payment failed:', result.error);
      }
    } catch (error) {
      console.error('[Submit] Payment submission error:', error);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte."
      });
    }
  };

  const generateInstallmentOptions = () => {
    if (!account) return [];
    const options = [];
    for (let i = 1; i <= 12; i++) {
      const installmentValue = account.preco / i;
      options.push({
        value: i.toString(),
        label: `${i}x de ${formatCurrency(installmentValue)}`
      });
    }
    return options;
  };

  if (isLoading || paymentMethodsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-tech-darker">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-tech-highlight" />
            <h2 className="text-2xl font-bold text-white">Carregando...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-tech-darker">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400">Conta não encontrada</h2>
            <Button 
              onClick={() => navigate("/")} 
              className="mt-4 bg-tech-accent hover:bg-tech-highlight"
            >
              Voltar para a página inicial
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showPixPayment) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-tech-darker">
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setShowPixPayment(false)}
                className="mb-6 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o checkout
              </Button>

              <Card className="bg-tech-card border-tech-accent/20 shadow-tech">
                <CardHeader>
                  <CardTitle className="text-lg text-white text-center">
                    Pagamento via PIX
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PixPayment
                    qrCode={pixData.qr_code}
                    qrCodeBase64={pixData.qr_code_base64}
                    amount={account.preco}
                    transactionId={pixData.transaction_id}
                    accountId={account.id}
                    onPaymentConfirmed={() => {
                      navigate(`/payment-success?account_id=${account.id}`);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-tech-darker">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(`/comprar/${account?.id}`)}
              className="mb-6 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para detalhes da conta
            </Button>

            <div className="space-y-8">
              {/* Load Mercado Pago SDK */}
              {mpPublicKey && paymentMethodsEnabled.card && (
                <MercadoPagoSDK
                  publicKey={mpPublicKey}
                  onSDKLoaded={handleSDKLoaded}
                  onError={handleSDKError}
                />
              )}

              {account && <OrderSummary account={account} />}

              <Card className="bg-tech-card border-tech-accent/20 shadow-tech">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Finalizar Compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <PersonalInfoSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      user={user}
                      isEmailValid={isEmailValid}
                      setIsEmailValid={setIsEmailValid}
                    />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-white">Forma de Pagamento</h3>
                      
                      <PaymentMethodSelection
                        paymentMethodsEnabled={paymentMethodsEnabled}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />

                      {/* Show error message if there's a retry option */}
                      {lastError && (
                        <div className="p-4 border rounded-lg border-blue-300 bg-blue-50">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-700">Erro no último pagamento</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (account && user) {
                                  const paymentData = {
                                    paymentMethodId: formData.paymentMethod === 'pix' ? 'pix' : paymentMethodId,
                                    token: cardToken,
                                    amount: account.preco,
                                    email: formData.email,
                                    identificationType: 'CPF',
                                    identificationNumber: formData.cpfCnpj.replace(/\D/g, ''),
                                    payerName: formData.nome.trim().replace(/\s+/g, ' '),
                                    accountId: account.id,
                                    userId: user.id,
                                    installments: parseInt(formData.installments),
                                    issuerId: issuerId
                                  };
                                  await retryLastPayment(paymentData);
                                }
                              }}
                              className="flex items-center space-x-1"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Tentar novamente</span>
                            </Button>
                          </div>
                        </div>
                      )}

                      <CardForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        paymentMethodsEnabled={paymentMethodsEnabled}
                        account={account}
                        getCardBrandIcon={getCardBrandIcon}
                        generateMonthOptions={generateMonthOptions}
                        generateYearOptions={generateYearOptions}
                        generateInstallmentOptions={generateInstallmentOptions}
                      />

                      <PixInfo
                        paymentMethodsEnabled={paymentMethodsEnabled}
                        formData={formData}
                        account={account}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isProcessing || !isEmailValid || isCreatingToken || (!paymentMethodsEnabled.pix && !paymentMethodsEnabled.card) || sdkError}
                      className="w-full btn-checkout text-white py-3 text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500"
                    >
                      {isProcessing || isCreatingToken ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {isCreatingToken ? 'Validando cartão...' : 'Processando pagamento...'}
                        </>
                      ) : (
                        "Pagar Agora"
                      )}
                    </Button>

                    {/* Security Notice */}
                    <div className="flex items-center justify-center space-x-2 text-sm text-white">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span>
                        <strong>Pagamento 100% seguro.</strong> Seus dados estão protegidos pelo Mercado Pago.
                      </span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Checkout;
