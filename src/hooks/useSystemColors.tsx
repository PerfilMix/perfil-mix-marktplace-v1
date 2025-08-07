import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemColors {
  'button-primary': string;
  'button-purchase': string;
  'link-primary': string;
  'highlight-primary': string;
  secondary: string;
  background: string;
  card: string;
  navbar: string;
  footer: string;
  accent: string;
  border: string;
  foreground: string;
  'muted-foreground': string;
  'primary-foreground': string;
  'secondary-foreground': string;
  'button-success-text': string;
  'button-outline-text': string;
  'filter-background': string;
}

interface SystemColorsContextType {
  colors: SystemColors;
  loadColors: () => Promise<void>;
  isLoading: boolean;
}

const defaultColors: SystemColors = {
  'button-primary': '213 94% 68%', // #3b82f6 tech-highlight
  'button-purchase': '142 76% 36%', // #10b981 emerald-600
  'link-primary': '213 94% 68%', // #3b82f6 tech-highlight
  'highlight-primary': '213 94% 68%', // #3b82f6 tech-highlight
  secondary: '217 91% 60%', // #2563eb tech-accent - Agora apenas para botões secundários
  background: '10 10 10', // #0a0a0a tech-darker
  card: '0 0% 11%', // #1D1D1D tech-card
  navbar: '15 15 15', // Dark navbar
  footer: '10 10 10', // Footer
  accent: '0 0% 20%', // Accent
  border: '0 0% 20%', // Border
  foreground: '0 0% 98%', // #fafafa
  'muted-foreground': '0 0% 65%', // #a1a1a1
  'primary-foreground': '0 0% 98%', // #fafafa
  'secondary-foreground': '0 0% 98%', // #fafafa
  'button-success-text': '0 0% 100%', // #ffffff
  'button-outline-text': '217 91% 60%', // #2563eb
  'filter-background': '0 0% 8%' // Filter background
};

const SystemColorsContext = createContext<SystemColorsContextType | undefined>(undefined);

export const SystemColorsProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<SystemColors>(defaultColors);
  const [isLoading, setIsLoading] = useState(true);

  const applyColorsToDOM = (colorValues: SystemColors) => {
    const root = document.documentElement;
    
    // Apply system colors to CSS variables
    root.style.setProperty('--button-primary', colorValues['button-primary']);
    root.style.setProperty('--button-purchase', colorValues['button-purchase']);
    root.style.setProperty('--link-primary', colorValues['link-primary']);
    root.style.setProperty('--highlight-primary', colorValues['highlight-primary']);
    root.style.setProperty('--primary', colorValues['button-primary']); // Keep primary for compatibility
    root.style.setProperty('--secondary', colorValues.secondary);
    root.style.setProperty('--background', colorValues.background);
    root.style.setProperty('--card', colorValues.card);
    root.style.setProperty('--navbar-bg', colorValues.navbar);
    root.style.setProperty('--footer-bg', colorValues.navbar); // Usar a mesma cor do navbar
    root.style.setProperty('--accent', colorValues.accent);
    root.style.setProperty('--border', colorValues.border);
    
    // Apply text colors
    root.style.setProperty('--foreground', colorValues.foreground);
    root.style.setProperty('--muted-foreground', colorValues['muted-foreground']);
    root.style.setProperty('--primary-foreground', colorValues['primary-foreground']);
    root.style.setProperty('--secondary-foreground', colorValues['secondary-foreground']);
    root.style.setProperty('--button-success-text', colorValues['button-success-text']);
    root.style.setProperty('--button-outline-text', colorValues['button-outline-text']);
    root.style.setProperty('--filter-background', colorValues['filter-background']);
    
    // Also update related variables for consistency
    root.style.setProperty('--popover', colorValues.card);
    root.style.setProperty('--input', colorValues.card); // Todos os inputs usam a cor dos cards
    root.style.setProperty('--background', colorValues.card); // Dropdowns e select usam a cor dos cards
    root.style.setProperty('--accent', colorValues.card); // Hover states em dropdowns
    root.style.setProperty('--ring', colorValues['button-primary']);
    
    // Update muted colors based on card color
    const cardHSL = colorValues.card.split(' ');
    if (cardHSL.length >= 3) {
      const lightness = parseInt(cardHSL[2].replace('%', ''));
      const mutedLightness = Math.min(lightness + 5, 25); // Slightly lighter than card
      root.style.setProperty('--muted', `${cardHSL[0]} ${cardHSL[1]} ${mutedLightness}%`);
    }
  };

  const loadColors = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('type', 'color')
        .eq('active', true);

      if (error) {
        console.error('Error loading colors:', error);
        return;
      }

      const loadedColors = { ...defaultColors };
      
      // Override with saved values
      data?.forEach(setting => {
        if (setting.key in loadedColors) {
          loadedColors[setting.key as keyof SystemColors] = setting.value;
        }
      });

      setColors(loadedColors);
      applyColorsToDOM(loadedColors);
    } catch (error) {
      console.error('Error loading system colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadColors();

    // Listen for color changes in real-time
    const channel = supabase
      .channel('color-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'type=eq.color'
        },
        () => {
          loadColors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SystemColorsContext.Provider value={{ colors, loadColors, isLoading }}>
      {children}
    </SystemColorsContext.Provider>
  );
};

export const useSystemColors = () => {
  const context = useContext(SystemColorsContext);
  if (context === undefined) {
    throw new Error('useSystemColors must be used within a SystemColorsProvider');
  }
  return context;
};