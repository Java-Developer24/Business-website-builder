import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Palette, Layout } from 'lucide-react';
import { toast } from 'sonner';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

const defaultColors: ThemeColors = {
  primary: '#0f172a',
  secondary: '#64748b',
  accent: '#3b82f6',
  background: '#ffffff',
  foreground: '#0f172a',
};

const presetThemes = [
  {
    name: 'Default',
    colors: {
      primary: '#0f172a',
      secondary: '#64748b',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#0f172a',
    },
  },
  {
    name: 'Ocean',
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      accent: '#22d3ee',
      background: '#f0fdfa',
      foreground: '#134e4a',
    },
  },
  {
    name: 'Forest',
    colors: {
      primary: '#15803d',
      secondary: '#16a34a',
      accent: '#22c55e',
      background: '#f0fdf4',
      foreground: '#14532d',
    },
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#dc2626',
      secondary: '#f97316',
      accent: '#facc15',
      background: '#fef2f2',
      foreground: '#7f1d1d',
    },
  },
  {
    name: 'Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#c084fc',
      background: '#faf5ff',
      foreground: '#581c87',
    },
  },
  {
    name: 'Dark',
    colors: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      accent: '#60a5fa',
      background: '#0f172a',
      foreground: '#f8fafc',
    },
  },
];

export default function ThemesPage() {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [selectedPreset, setSelectedPreset] = useState<string>('Default');

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setColors(preset.colors);
    setSelectedPreset(preset.name);
    toast.success(`Applied ${preset.name} theme`);
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors({ ...colors, [key]: value });
    setSelectedPreset('Custom');
  };

  const saveTheme = () => {
    // In a real app, this would save to the database
    toast.success('Theme saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theme Customization</h1>
          <p className="text-muted-foreground">Customize your website's appearance and branding</p>
        </div>
        <Button onClick={saveTheme}>
          <Palette className="mr-2 h-4 w-4" />
          Save Theme
        </Button>
      </div>

      {/* Preset Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Preset Themes
          </CardTitle>
          <CardDescription>Choose from pre-designed color schemes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedPreset === preset.name ? 'border-primary ring-2 ring-primary' : 'border-border'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex gap-1 h-12">
                    <div className="flex-1 rounded" style={{ backgroundColor: preset.colors.primary }} />
                    <div className="flex-1 rounded" style={{ backgroundColor: preset.colors.secondary }} />
                    <div className="flex-1 rounded" style={{ backgroundColor: preset.colors.accent }} />
                  </div>
                  <div className="text-sm font-medium text-center">{preset.name}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Custom Colors
          </CardTitle>
          <CardDescription>Fine-tune individual colors to match your brand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="primary"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary">Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="secondary"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="accent"
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Background Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="background"
                  value={colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foreground">Text Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="foreground"
                  value={colors.foreground}
                  onChange={(e) => handleColorChange('foreground', e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.foreground}
                  onChange={(e) => handleColorChange('foreground', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your theme looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.background, color: colors.foreground }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
              Sample Heading
            </h2>
            <p className="mb-4">This is how your text will appear on the website with the selected colors.</p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: colors.primary }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: colors.secondary }}
              >
                Secondary Button
              </button>
              <button
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: colors.accent }}
              >
                Accent Button
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
