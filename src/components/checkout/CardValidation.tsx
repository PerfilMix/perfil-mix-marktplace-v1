
interface CardBrand {
  name: string;
  pattern: RegExp;
  lengths: number[];
  cvvLength: number;
  gaps: number[];
}

const cardBrands: CardBrand[] = [
  {
    name: 'visa',
    pattern: /^4/,
    lengths: [13, 16, 19],
    cvvLength: 3,
    gaps: [4, 8, 12]
  },
  {
    name: 'mastercard',
    pattern: /^(5[1-5]|2[2-7])/,
    lengths: [16],
    cvvLength: 3,
    gaps: [4, 8, 12]
  },
  {
    name: 'amex',
    pattern: /^3[47]/,
    lengths: [15],
    cvvLength: 4,
    gaps: [4, 10]
  },
  {
    name: 'elo',
    pattern: /^(4011|4312|4389|4514|4573|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/,
    lengths: [16],
    cvvLength: 3,
    gaps: [4, 8, 12]
  },
  {
    name: 'hipercard',
    pattern: /^(606282|3841)/,
    lengths: [13, 16, 19],
    cvvLength: 3,
    gaps: [4, 8, 12]
  }
];

export const detectCardBrand = (cardNumber: string): CardBrand | null => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  return cardBrands.find(brand => brand.pattern.test(cleanNumber)) || null;
};

export const formatCardNumber = (value: string): string => {
  const cleanValue = value.replace(/\s/g, '');
  const brand = detectCardBrand(cleanValue);
  
  if (!brand) {
    // Default formatting for unknown cards
    return cleanValue.replace(/(\d{4})/g, '$1 ').trim();
  }

  let formatted = '';
  let index = 0;
  
  for (let i = 0; i < cleanValue.length; i++) {
    if (brand.gaps.includes(i) && formatted.length > 0) {
      formatted += ' ';
    }
    formatted += cleanValue[i];
  }
  
  return formatted;
};

export const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Basic length check
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleanNumber)) return false;
  
  const brand = detectCardBrand(cleanNumber);
  
  if (!brand) return false;
  if (!brand.lengths.includes(cleanNumber.length)) return false;
  
  // Enhanced Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const validateCVV = (cvv: string, cardNumber: string): boolean => {
  // Basic CVV validation
  if (!cvv || !/^\d+$/.test(cvv)) return false;
  
  const brand = detectCardBrand(cardNumber);
  if (!brand) return cvv.length >= 3 && cvv.length <= 4;
  
  return cvv.length === brand.cvvLength;
};

export const validateExpirationDate = (month: string, year: string): boolean => {
  if (!month || !year) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  // Validate month range
  if (expMonth < 1 || expMonth > 12) return false;
  
  // Validate year range (current year to 30 years in future)
  if (expYear < currentYear || expYear > currentYear + 30) return false;
  
  // Check if card is expired
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

// Enhanced CPF validation with proper algorithm
export const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '');
  
  // Check basic length
  if (cleanCpf.length !== 11) return false;
  
  // Check for invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // First verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }
  let remainder = sum * 10 % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf[9])) return false;
  
  // Second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }
  remainder = sum * 10 % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCpf[10]);
};

// Enhanced name validation
export const validatePayerName = (name: string): boolean => {
  if (!name || name.trim().length < 2) return false;
  
  // Remove extra spaces and check if it has at least first and last name
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const nameParts = cleanName.split(' ').filter(part => part.length > 0);
  
  // Should have at least 2 parts (first and last name)
  if (nameParts.length < 2) return false;
  
  // Check if contains only letters, spaces, and common name characters
  const namePattern = /^[a-zA-ZÀ-ÿ\s'.-]+$/;
  return namePattern.test(cleanName);
};

export const getCardBrandIcon = (cardNumber: string): string => {
  const brand = detectCardBrand(cardNumber);
  if (!brand) return '💳';
  
  const icons: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    elo: '💳',
    hipercard: '💳'
  };
  
  return icons[brand.name] || '💳';
};
