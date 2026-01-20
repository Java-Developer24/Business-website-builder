import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Palette, Save, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface BrandSettings {
  businessName: string;
  tagline: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
}

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState<BrandSettings>({
    businessName: '',
    tagline: '',
    logo: '',
    favicon: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    fontHeading: 'Inter',
    fontBody: 'Inter',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/branding');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, favicon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload logo if changed
      let logoUrl = settings.logo;
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          logoUrl = url;
        }
      }

      // Upload favicon if changed
      let faviconUrl = settings.favicon;
      if (faviconFile) {
        const formData = new FormData();
        formData.append('file', faviconFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          faviconUrl = url;
        }
      }

      // Save settings
      const response = await fetch('/api/settings/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          logo: logoUrl,
          favicon: faviconUrl,
        }),
      });

      if (response.ok) {
        toast.success('Branding settings saved successfully');
        // Apply theme changes
        applyTheme();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = () => {
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--secondary', settings.secondaryColor);
    root.style.setProperty('--accent', settings.accentColor);
  };

  const handlePreview = () => {
    applyTheme();
    toast.success('Theme preview applied');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Branding & Theme</h1>
        <p className="text-muted-foreground">Customize your brand identity and visual theme</p>
      </div>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Your business name and tagline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={settings.businessName}
              onChange={handleChange}
              placeholder="My Business"
            />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              value={settings.tagline}
              onChange={handleChange}
              placeholder="Your business tagline"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo & Favicon */}
      <Card>
        <CardHeader>
          <CardTitle>Logo & Favicon</CardTitle>
          <CardDescription>Upload your brand assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              {settings.logo && (
                <img src={settings.logo} alt="Logo" className="h-16 w-auto object-contain border rounded" />
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: PNG or SVG, max 2MB</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label>Favicon</Label>
            <div className="flex items-center gap-4 mt-2">
              {settings.favicon && (
                <img src={settings.favicon} alt="Favicon" className="h-8 w-8 object-contain border rounded" />
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 32x32px ICO or PNG</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Palette className="inline-block mr-2 h-5 w-5" />
            Brand Colors
          </CardTitle>
          <CardDescription>Choose your brand color palette</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleChange}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  id="accentColor"
                  name="accentColor"
                  value={settings.accentColor}
                  onChange={handleChange}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Colors will be applied to buttons, links, and other UI elements across your site.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Select fonts for headings and body text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fontHeading">Heading Font</Label>
              <Input
                id="fontHeading"
                name="fontHeading"
                value={settings.fontHeading}
                onChange={handleChange}
                placeholder="Inter"
              />
            </div>
            <div>
              <Label htmlFor="fontBody">Body Font</Label>
              <Input
                id="fontBody"
                name="fontBody"
                value={settings.fontBody}
                onChange={handleChange}
                placeholder="Inter"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handlePreview} variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Preview Changes
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
