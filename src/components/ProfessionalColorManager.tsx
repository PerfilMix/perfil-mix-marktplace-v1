import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSystemColors } from '@/hooks/useSystemColors';
import { supabase } from '@/integrations/supabase/client';
import { ColorPicker } from '@/components/ui/color-picker';
import { Palette, Save, RotateCcw, Sparkles, Zap, Eye } from 'lucide-react';

interface ColorTheme {
  name: string;
  description: string;
  icon: React.ReactNode;
  colors: Record<string, string>;
}

const THEME_PRESETS: ColorTheme[] = [
  {
    name: 'Tech Azul',
    description: 'Design moderno com tons de azul profissional',
    icon: <Zap className="h-4 w-4" />,
    colors: {
      'button-primary': '213 94% 68%', // Blue
      'button-purchase': '142 76% 36%', // Emerald
      'link-primary': '213 94% 68%',
      'highlight-primary': '213 94% 68%',
      'secondary': '217 91% 60%',
    }
  },
  {
    name: 'Corporate',
    description: 'Cores corporativas elegantes e profissionais',
    icon: <Eye className="h-4 w-4" />,
    colors: {
      'button-primary': '221 83% 53%', // Corporate blue
      'button-purchase': '142 71% 45%', // Professional green
      'link-primary': '221 83% 53%',
      'highlight-primary': '221 83% 53%',
      'secondary': '215 84% 61%',
    }
  },
  {
    name: 'Energético',
    description: 'Cores vibrantes que chamam atenção',
    icon: <Sparkles className="h-4 w-4" />,
    colors: {
      'button-primary': '262 83% 58%', // Purple
      'button-purchase': '31 95% 50%', // Orange
      'link-primary': '262 83% 58%',
      'highlight-primary': '262 83% 58%',
      'secondary': '280 100% 70%',
    }
  }
];

const COLOR_CATEGORIES = {
  brand: {
    title: 'Cores da Marca',
    description: 'Cores principais que definem sua identidade visual',
    colors: [
      {
        key: 'button-primary',
        label: 'Primária',
        description: 'Cor principal dos botões e elementos de destaque',
        default: '213 94% 68%'
      },
      {
        key: 'button-purchase',
        label: 'Compra/Ação',
        description: 'Cor para botões de compra e ações importantes',
        default: '142 76% 36%'
      },
      {
        key: 'secondary',
        label: 'Secundária',
        description: 'Cor para elementos secundários',
        default: '217 91% 60%'
      }
    ]
  },
  interface: {
    title: 'Interface',
    description: 'Cores dos elementos de interface e navegação',
    colors: [
      {
        key: 'background',
        label: 'Fundo Principal',
        description: 'Cor de fundo da aplicação',
        default: '10 10 10'
      },
      {
        key: 'card',
        label: 'Cards',
        description: 'Fundo dos cards e painéis',
        default: '0 0% 11%'
      },
      {
        key: 'navbar',
        label: 'Navbar',
        description: 'Fundo da barra de navegação',
        default: '15 15 15'
      }
    ]
  },
  text: {
    title: 'Texto',
    description: 'Cores do texto e tipografia',
    colors: [
      {
        key: 'foreground',
        label: 'Texto Principal',
        description: 'Cor do texto principal',
        default: '0 0% 98%'
      },
      {
        key: 'muted-foreground',
        label: 'Texto Secundário',
        description: 'Cor do texto secundário e descrições',
        default: '0 0% 65%'
      }
    ]
  }
};

const ProfessionalColorManager = () => {
  const { toast } = useToast();
  const { colors: systemColors, loadColors, isLoading: systemLoading } = useSystemColors();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');

  useEffect(() => {
    if (!systemLoading && systemColors) {
      // Initialize with current system colors
      const allColors = Object.keys(COLOR_CATEGORIES).reduce((acc, categoryKey) => {
        COLOR_CATEGORIES[categoryKey].colors.forEach(colorConfig => {
          // Use bracket notation to safely access systemColors properties
          const systemColorValue = (systemColors as any)[colorConfig.key];
          acc[colorConfig.key] = systemColorValue || colorConfig.default;
        });
        return acc;
      }, {} as Record<string, string>);
      
      setColors(allColors);
    }
  }, [systemColors, systemLoading]);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    
    // Apply immediately for preview
    const root = document.documentElement;
    const cssVar = `--${key.replace('_', '-')}`;
    root.style.setProperty(cssVar, value);
  };

  const convertHSLToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map((v, i) => {
      if (i === 0) return parseInt(v);
      return parseInt(v.replace('%', '')) / 100;
    });

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const convertHexToHSL = (hex: string): string => {
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyTheme = async (theme: ColorTheme) => {
    const newColors = { ...colors, ...theme.colors };
    setColors(newColors);
    
    // Apply to DOM immediately
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace('_', '-')}`;
      root.style.setProperty(cssVar, value);
    });

    toast({
      title: `Tema "${theme.name}" aplicado! 🎨`,
      description: 'As cores foram atualizadas. Não se esqueça de salvar.',
    });
  };

  const saveColors = async () => {
    setIsSaving(true);
    try {
      // Get all current color keys from the database
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('key')
        .eq('type', 'color');

      const existingKeys = existingSettings?.map(s => s.key) || [];
      
      // Delete existing color settings
      if (existingKeys.length > 0) {
        await supabase
          .from('site_settings')
          .delete()
          .eq('type', 'color');
      }

      // Insert new color settings (only the ones we're managing)
      const settingsToInsert = Object.entries(colors).map(([key, value]) => ({
        type: 'color',
        key,
        value,
        active: true
      }));

      const { error } = await supabase
        .from('site_settings')
        .insert(settingsToInsert);

      if (error) throw error;

      await loadColors();

      toast({
        title: "Cores salvas! ✅",
        description: "As configurações foram aplicadas com sucesso."
      });
    } catch (error) {
      console.error('Error saving colors:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    const defaultColors = Object.keys(COLOR_CATEGORIES).reduce((acc, categoryKey) => {
      COLOR_CATEGORIES[categoryKey].colors.forEach(colorConfig => {
        acc[colorConfig.key] = colorConfig.default;
      });
      return acc;
    }, {} as Record<string, string>);
    
    setColors(defaultColors);
    
    // Apply to DOM
    const root = document.documentElement;
    Object.entries(defaultColors).forEach(([key, value]) => {
      const cssVar = `--${key.replace('_', '-')}`;
      root.style.setProperty(cssVar, value);
    });

    try {
      await supabase.from('site_settings').delete().eq('type', 'color');
      await loadColors();
    } catch (error) {
      console.error('Error resetting colors:', error);
    }
    
    toast({
      title: "Cores restauradas",
      description: "Valores padrão aplicados com sucesso."
    });
  };

  if (systemLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Carregando configurações...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Configurações de Cores
        </CardTitle>
        <p className="text-muted-foreground">
          Configure as cores da sua plataforma de forma simples e profissional
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Theme Presets */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Temas Prontos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {THEME_PRESETS.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="h-auto p-3 flex flex-col items-start text-left"
                onClick={() => applyTheme(theme)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {theme.icon}
                  <span className="font-medium text-sm">{theme.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {theme.description}
                </span>
                <div className="flex gap-1 mt-2">
                  {Object.values(theme.colors).slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  ))}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Color Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="brand">Marca</TabsTrigger>
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="text">Texto</TabsTrigger>
          </TabsList>
          
          {Object.entries(COLOR_CATEGORIES).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
              <div>
                <h3 className="font-medium">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="grid gap-4">
                {category.colors.map((colorConfig) => (
                  <div key={colorConfig.key} className="space-y-2 p-4 border rounded">
                    <div>
                      <label className="text-sm font-medium">{colorConfig.label}</label>
                      <p className="text-xs text-muted-foreground">{colorConfig.description}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                      {/* Color Picker Button */}
                      <input
                        type="color"
                        value={convertHSLToHex(colors[colorConfig.key] || colorConfig.default)}
                        onChange={(e) => handleColorChange(colorConfig.key, convertHexToHSL(e.target.value))}
                        className="w-12 h-10 rounded border-2 border-border cursor-pointer bg-transparent"
                        title="Clique para escolher uma cor"
                      />
                      
                      {/* Color Preview */}
                      <div 
                        className="w-12 h-10 rounded border flex-shrink-0"
                        style={{ backgroundColor: `hsl(${colors[colorConfig.key] || colorConfig.default})` }}
                      />
                      
                      {/* Hex Input */}
                      <input
                        type="text"
                        value={convertHSLToHex(colors[colorConfig.key] || colorConfig.default)}
                        onChange={(e) => {
                          const hexValue = e.target.value;
                          // Validate hex format
                          const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                          if (hexRegex.test(hexValue) || hexValue === '') {
                            const fullHex = hexValue.startsWith('#') ? hexValue : `#${hexValue}`;
                            if (fullHex.length === 7 || fullHex === '#') {
                              handleColorChange(colorConfig.key, convertHexToHSL(fullHex));
                            }
                          }
                        }}
                        placeholder="#3b82f6"
                        className="flex-1 px-3 py-2 bg-background border rounded text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={saveColors}
            disabled={isSaving}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
          
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
          <strong>💡 Dica:</strong> Use os temas prontos como ponto de partida e personalize as cores conforme necessário. 
          As mudanças são aplicadas instantaneamente para visualização.
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalColorManager;