import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSystemColors } from '@/hooks/useSystemColors';
import { supabase } from '@/integrations/supabase/client';
import { Palette, RotateCcw, Save } from 'lucide-react';

interface ColorSetting {
  key: string;
  label: string;
  description: string;
  cssVar: string;
  defaultValue: string;
}

const ColorSettingsManager = () => {
  const { toast } = useToast();
  const { colors: systemColors, loadColors, isLoading: systemLoading } = useSystemColors();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const colorSettings: ColorSetting[] = [
    {
      key: 'button-primary',
      label: 'Cor dos Botões Gerais',
      description: 'Cor principal dos botões do sistema (exceto botão de compra)',
      cssVar: '--button-primary',
      defaultValue: '213 94% 68%' // #3b82f6 tech-highlight
    },
    {
      key: 'button-purchase',
      label: 'Cor do Botão de Compra',
      description: 'Cor específica para o botão de compra/vendas',
      cssVar: '--button-purchase',
      defaultValue: '142 76% 36%' // #10b981 emerald-600
    },
    {
      key: 'link-primary',
      label: 'Cor dos Links',
      description: 'Cor dos links e elementos clicáveis',
      cssVar: '--link-primary',
      defaultValue: '213 94% 68%' // #3b82f6 tech-highlight
    },
    {
      key: 'highlight-primary',
      label: 'Cor dos Destaques',
      description: 'Cor para elementos em destaque e realces',
      cssVar: '--highlight-primary',
      defaultValue: '213 94% 68%' // #3b82f6 tech-highlight
    },
    {
      key: 'secondary',
      label: 'Cor dos Botões Secundários', 
      description: 'Cor dos botões secundários (como nos botões das imagens enviadas)',
      cssVar: '--secondary',
      defaultValue: '217 91% 60%' // #2563eb tech-accent
    },
    {
      key: 'background',
      label: 'Fundo Principal',
      description: 'Cor de fundo da aplicação',
      cssVar: '--background',
      defaultValue: '10 10 10' // #0a0a0a tech-darker
    },
    {
      key: 'card',
      label: 'Fundo dos Cards e Inputs',
      description: 'Cor de fundo dos cards, painéis, campos de entrada e dropdowns',
      cssVar: '--card',
      defaultValue: '0 0% 11%' // #1D1D1D tech-card
    },
    {
      key: 'foreground',
      label: 'Texto Principal',
      description: 'Cor do texto principal do sistema',
      cssVar: '--foreground',
      defaultValue: '0 0% 98%' // #fafafa
    },
    {
      key: 'muted-foreground',
      label: 'Texto Secundário',
      description: 'Cor do texto secundário e descrições',
      cssVar: '--muted-foreground',
      defaultValue: '0 0% 65%' // #a1a1a1
    },
    {
      key: 'primary-foreground',
      label: 'Texto sobre Primária',
      description: 'Cor do texto sobre elementos com cor primária',
      cssVar: '--primary-foreground',
      defaultValue: '0 0% 98%' // #fafafa
    },
    {
      key: 'secondary-foreground',
      label: 'Texto sobre Secundária',
      description: 'Cor do texto sobre elementos com cor secundária',
      cssVar: '--secondary-foreground',
      defaultValue: '0 0% 98%' // #fafafa
    },
    {
      key: 'button-success-text',
      label: 'Texto em Botões de Compra',
      description: 'Cor do texto em botões de compra/sucesso',
      cssVar: '--button-success-text',
      defaultValue: '0 0% 100%' // #ffffff
    },
    {
      key: 'button-outline-text',
      label: 'Texto em Botões com Borda',
      description: 'Cor do texto em botões com borda (Detalhes da Conta)',
      cssVar: '--button-outline-text',
      defaultValue: '217 91% 60%' // #2563eb
    },
    {
      key: 'navbar',
      label: 'Navbar e Rodapé',
      description: 'Cor de fundo da barra de navegação e rodapé (sempre iguais)',
      cssVar: '--navbar-bg',
      defaultValue: '15 15 15' // Cor escura para navbar e footer
    },
    {
      key: 'accent',
      label: 'Cor de Destaque',
      description: 'Cor para elementos em destaque (hover, focus)',
      cssVar: '--accent',
      defaultValue: '0 0% 20%'
    },
    {
      key: 'border',
      label: 'Bordas',
      description: 'Cor das bordas dos elementos',
      cssVar: '--border',
      defaultValue: '0 0% 20%'
    },
    {
      key: 'filter-background',
      label: 'Fundo dos Filtros',
      description: 'Cor de fundo dos componentes de filtro para melhor visibilidade',
      cssVar: '--filter-background',
      defaultValue: '0 0% 8%' // Mais escuro que o fundo principal
    }
  ];

  useEffect(() => {
    // Initialize with system colors when they load
    if (!systemLoading && systemColors) {
      // Convert SystemColors interface to Record<string, string>
      const colorsRecord: Record<string, string> = {
        'button-primary': systemColors['button-primary'],
        'button-purchase': systemColors['button-purchase'] || '142 76% 36%',
        'link-primary': systemColors['link-primary'],
        'highlight-primary': systemColors['highlight-primary'],
        secondary: systemColors.secondary,
        background: systemColors.background,
        card: systemColors.card,
        foreground: systemColors.foreground || '0 0% 98%',
        'muted-foreground': systemColors['muted-foreground'] || '0 0% 65%',
        'primary-foreground': systemColors['primary-foreground'] || '0 0% 98%',
        'secondary-foreground': systemColors['secondary-foreground'] || '0 0% 98%',
        'button-success-text': systemColors['button-success-text'] || '0 0% 100%',
        'button-outline-text': systemColors['button-outline-text'] || '217 91% 60%',
        navbar: systemColors.navbar,
        footer: systemColors.footer,
        accent: systemColors.accent,
        border: systemColors.border,
        'filter-background': systemColors['filter-background'] || '0 0% 8%'
      };
      setColors(colorsRecord);
    }
  }, [systemColors, systemLoading]);

  const handleColorChange = (key: string, value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    
    // Apply immediately for preview
    const root = document.documentElement;
    const setting = colorSettings.find(s => s.key === key);
    if (setting) {
      root.style.setProperty(setting.cssVar, value);
      
      // Se for alteração no card, também atualizar inputs, popovers, dropdowns e fundos relacionados
      if (key === 'card') {
        root.style.setProperty('--input', value);
        root.style.setProperty('--popover', value);
        root.style.setProperty('--background', value); // Para SelectTrigger e outros fundos
        root.style.setProperty('--accent', value); // Para hover states em dropdowns
      }
    }
  };

  const convertHexToHSL = (hex: string): string => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
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

  const saveColorSettings = async () => {
    setIsSaving(true);
    try {
      // Delete existing color settings
      await supabase
        .from('site_settings')
        .delete()
        .eq('type', 'color');

      // Insert new color settings
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

      // Reload system colors to apply changes globally
      await loadColors();

      toast({
        title: "Cores atualizadas! 🎨",
        description: "As configurações de cores foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Error saving color settings:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações de cores."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    const defaultColors: Record<string, string> = {};
    colorSettings.forEach(setting => {
      defaultColors[setting.key] = setting.defaultValue;
    });
    
    setColors(defaultColors);
    
    // Save defaults to database and reload system colors
    try {
      await supabase.from('site_settings').delete().eq('type', 'color');
      await loadColors(); // This will apply defaults globally
    } catch (error) {
      console.error('Error resetting colors:', error);
    }
    
    toast({
      title: "Cores restauradas",
      description: "As cores foram restauradas para os valores padrão."
    });
  };

  if (systemLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Carregando configurações de cores...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Configurações de Cores
        </CardTitle>
        <p className="text-muted-foreground">
          Personalize as cores do sistema de acordo com sua marca
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Grid de configurações de cores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colorSettings.map((setting) => (
            <div key={setting.key} className="space-y-3">
              <div>
                <Label className="text-sm font-medium">{setting.label}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {setting.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={convertHSLToHex(colors[setting.key] || setting.defaultValue)}
                  onChange={(e) => handleColorChange(setting.key, convertHexToHSL(e.target.value))}
                  className="w-12 h-10 rounded-md border border-tech-accent/20 bg-transparent cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={convertHSLToHex(colors[setting.key] || setting.defaultValue)}
                    onChange={(e) => {
                      // Check if it's a valid hex color
                      const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                      if (hexRegex.test(e.target.value) || e.target.value === '') {
                        const hexValue = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                        if (hexValue.length === 7 || hexValue.length === 4) {
                          handleColorChange(setting.key, convertHexToHSL(hexValue));
                        }
                      }
                    }}
                    placeholder="Hex (ex: #3b82f6)"
                    className="w-full px-3 py-2 bg-tech-card border border-tech-accent/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-tech-highlight font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={saveColorSettings}
            disabled={isSaving}
            className="flex-1 tech-gradient"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Cores"}
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

        <div className="text-xs text-muted-foreground bg-tech-card/30 p-3 rounded-md">
          <strong>Dica:</strong> Use o seletor de cores ou insira códigos hexadecimais (ex: #3b82f6). 
          As mudanças são aplicadas instantaneamente para preview.
          <br /><br />
          <strong>Importante:</strong> O "Fundo dos Cards e Inputs" afeta o fundo de todos os cards, painéis, campos de entrada e dropdowns em todo o sistema. 
          A "Cor dos Botões Secundários" afeta apenas os botões como "Detalhes da Conta", "Voltar ao Catálogo", etc.
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorSettingsManager;