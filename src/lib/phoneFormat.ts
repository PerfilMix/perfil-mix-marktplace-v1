// Phone formatting utilities
export const formatPhoneDisplay = (phone: string): string => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Format as (XX) X XXXX-XXXX for Brazilian phones
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 3)} ${cleanPhone.slice(3, 7)}-${cleanPhone.slice(7)}`;
  }
  
  // Format as (XX) XXXX-XXXX for 10-digit phones
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }
  
  // Return original if doesn't match expected patterns
  return phone;
};

export const getWhatsAppUrl = (phone: string): string => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Add country code 55 for Brazil if not present
  const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  return `https://wa.me/${phoneWithCountry}`;
};