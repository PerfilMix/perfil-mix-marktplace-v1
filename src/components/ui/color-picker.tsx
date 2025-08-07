import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#1f2937', // Dark gray
  '#ffffff', // White
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  description
}) => {
  const [hexValue, setHexValue] = useState(() => convertHSLToHex(value));
  const [isOpen, setIsOpen] = useState(false);

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

  const handleColorChange = (newHex: string) => {
    setHexValue(newHex);
    onChange(convertHexToHSL(newHex));
  };

  const handlePresetClick = (presetColor: string) => {
    handleColorChange(presetColor);
    setIsOpen(false);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHexValue(inputValue);
    
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(inputValue)) {
      const hexValue = inputValue.startsWith('#') ? inputValue : `#${inputValue}`;
      if (hexValue.length === 7 || hexValue.length === 4) {
        onChange(convertHexToHSL(hexValue));
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-10 p-0 border-2"
              style={{ backgroundColor: hexValue }}
            >
              <Palette className="h-4 w-4 text-white mix-blend-difference" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="start">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Cores Populares</Label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handlePresetClick(color)}
                      className="w-8 h-8 rounded-md border-2 border-muted-foreground/20 hover:border-primary transition-colors relative"
                      style={{ backgroundColor: color }}
                    >
                      {hexValue.toLowerCase() === color.toLowerCase() && (
                        <Check className="h-4 w-4 text-white mix-blend-difference absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Seletor de Cor</Label>
                <input
                  type="color"
                  value={hexValue}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-10 rounded-md border cursor-pointer"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex-1">
          <Input
            type="text"
            value={hexValue}
            onChange={handleHexInputChange}
            placeholder="#3b82f6"
            className="font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
};