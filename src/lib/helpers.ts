// Updated to use consistent 768px breakpoint
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return true; // Default to desktop for SSR
  return window.innerWidth >= 768;
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false; // Default to not mobile for SSR
  return window.innerWidth < 768;
};

// Currency formatting
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Number formatting with K/M abbreviations
export const formatNumberWithK = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Updated Nicho options - only the 13 requested niches
export const getNichosList = (): string[] => {
  return [
    "Saúde",
    "Moda",
    "Beleza",
    "Pet",
    "Humor",
    "Curiosidades",
    "ASMR",
    "Carros",
    "Futebol",
    "Religião",
    "Motivacional",
    "Cortes",
    "Notícias"
  ];
};

// Updated Seguidores ranges with new ranges
export const getSeguidoresRanges = () => {
  return [
    { value: "todos", label: "Todos os seguidores" },
    { value: "100-10k", label: "100 - 10K seguidores" },
    { value: "10k-50k", label: "10K - 50K seguidores" },
    { value: "50k-100k", label: "50K - 100K seguidores" },
    { value: "100k-500k", label: "100K - 500K seguidores" },
    { value: "500k-1m", label: "500K - 1M seguidores" },
    { value: "1m+", label: "1M+ seguidores" }
  ];
};

// Updated Países list - only the 9 requested countries
export const getPaisesList = () => {
  return [
    { value: "todos", label: "Todos os países" },
    { value: "Brasil", label: "Brasil" },
    { value: "Estados Unidos", label: "Estados Unidos" },
    { value: "Alemanha", label: "Alemanha" },
    { value: "França", label: "França" },
    { value: "Reino Unido", label: "Reino Unido" },
    { value: "Portugal", label: "Portugal" },
    { value: "Egito", label: "Egito" },
    { value: "Indonésia", label: "Indonésia" },
    { value: "Espanha", label: "Espanha" }
  ];
};

// Plataformas list - keeping existing
export const getPlataformasList = (): string[] => {
  return [
    "TikTok",
    "Instagram", 
    "YouTube",
    "Facebook",
    "Kwai",
    "Shopify"
  ];
};

// Preço ranges for filtering
export const getPrecoRanges = () => {
  return [
    { value: "todos", label: "Todos os preços" },
    { value: "0-100", label: "Até R$ 100" },
    { value: "100-200", label: "De R$ 100 - R$ 200" },
    { value: "200-300", label: "De R$ 200 - R$ 300" },
    { value: "300-400", label: "De R$ 300 - R$ 400" },
    { value: "400+", label: "Acima de R$ 400" }
  ];
};

// Sophisticated color palette for countries
export const getPaisColor = (pais: string): string => {
  const colors: { [key: string]: string } = {
    "Brasil": "#10b981",     // Emerald green - more sophisticated
    "Estados Unidos": "#dc2626", // Clean red
    "Alemanha": "#1f2937",   // Dark gray instead of black
    "França": "#2563eb",     // Royal blue
    "Reino Unido": "#3730a3", // Indigo
    "Portugal": "#dc2626",   // Clean red
    "Egito": "#b91c1c",     // Deep red
    "Indonésia": "#dc2626", // Clean red
    "Espanha": "#b91c1c"    // Deep red
  };
  return colors[pais] || "#6366f1"; // Indigo as fallback
};

// Platform styles - updated with more sophisticated colors
export const getPlatformStyle = (platform: string) => {
  const styles: { [key: string]: { color: string } } = {
    "TikTok": { color: "#ec4899" },    // Pink-500 - more refined
    "Instagram": { color: "#e11d48" }, // Rose-600 - elegant
    "YouTube": { color: "#dc2626" },   // Red-600 - clean
    "Facebook": { color: "#2563eb" },  // Blue-600 - professional  
    "Kwai": { color: "#8b5cf6" },     // Violet-500 - sophisticated
    "Shopify": { color: "#10b981" }    // Emerald-500 - modern green
  };
  return styles[platform] || { color: "#6366f1" }; // Indigo as fallback
};

// Date formatting
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
