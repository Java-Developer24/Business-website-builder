import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  businessCountry: string;
  taxId: string;
  currency: string;
  timezone: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
}

interface PaymentSettings {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  paymentMethods: string[];
  currency: string;
}

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZip: '',
    businessCountry: '',
    taxId: '',
    currency: 'USD',
    timezone: 'America/New_York',
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: '',
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    paymentMethods: ['card'],
    currency: 'USD',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/general');
      if (response.ok) {
        const data = await response.json();
        if (data.business) setBusinessSettings(data.business);
        if (data.email) setEmailSettings(data.email);
        if (data.payment) setPaymentSettings(data.payment);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'business', settings: businessSettings }),
      });

      if (response.ok) {
        toast.success('Business settings saved successfully');
      } else {
        toast.error('Failed to save business settings');
      }
    } catch (error) {
      toast.error('Error saving business settings');
    } finally {
      setSaving(false);
    }
  };

  const saveEmailSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', settings: emailSettings }),
      });

      if (response.ok) {
        toast.success('Email settings saved successfully');
      } else {
        toast.error('Failed to save email settings');
      }
    } catch (error) {
      toast.error('Error saving email settings');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment', settings: paymentSettings }),
      });

      if (response.ok) {
        toast.success('Payment settings saved successfully');
      } else {
        toast.error('Failed to save payment settings');
      }
    } catch (error) {
      toast.error('Error saving payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">Manage your business, email, and payment settings</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList>
          <TabsTrigger value="business">Business Profile</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="payment">Payment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business profile and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessSettings.businessName}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, businessName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessSettings.businessEmail}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, businessEmail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessPhone">Phone Number</Label>
                  <Input
                    id="businessPhone"
                    value={businessSettings.businessPhone}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, businessPhone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    value={businessSettings.taxId}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, taxId: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessAddress">Street Address</Label>
                <Input
                  id="businessAddress"
                  value={businessSettings.businessAddress}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, businessAddress: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="businessCity">City</Label>
                  <Input
                    id="businessCity"
                    value={businessSettings.businessCity}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, businessCity: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessState">State</Label>
                  <Input
                    id="businessState"
                    value={businessSettings.businessState}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, businessState: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessZip">ZIP Code</Label>
                  <Input
                    id="businessZip"
                    value={businessSettings.businessZip}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, businessZip: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessCountry">Country</Label>
                  <Input
                    id="businessCountry"
                    value={businessSettings.businessCountry}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, businessCountry: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={businessSettings.currency}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, currency: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={businessSettings.timezone}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, timezone: e.target.value })
                  }
                />
              </div>

              <Button onClick={saveBusinessSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Business Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={emailSettings.smtpSecure}
                  onCheckedChange={(checked) =>
                    setEmailSettings({ ...emailSettings, smtpSecure: checked })
                  }
                />
                <Label htmlFor="smtpSecure">Use TLS/SSL</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    placeholder="noreply@yourbusiness.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    placeholder="Your Business Name"
                  />
                </div>
              </div>

              <Button onClick={saveEmailSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Email Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure Stripe payment integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                <Input
                  id="stripePublishableKey"
                  value={paymentSettings.stripePublishableKey}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, stripePublishableKey: e.target.value })
                  }
                  placeholder="pk_test_..."
                />
              </div>

              <div>
                <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                <Input
                  id="stripeSecretKey"
                  type="password"
                  value={paymentSettings.stripeSecretKey}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })
                  }
                  placeholder="sk_test_..."
                />
              </div>

              <div>
                <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
                <Input
                  id="stripeWebhookSecret"
                  type="password"
                  value={paymentSettings.stripeWebhookSecret}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, stripeWebhookSecret: e.target.value })
                  }
                  placeholder="whsec_..."
                />
              </div>

              <div>
                <Label htmlFor="paymentCurrency">Payment Currency</Label>
                <Input
                  id="paymentCurrency"
                  value={paymentSettings.currency}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, currency: e.target.value })
                  }
                  placeholder="USD"
                />
              </div>

              <Button onClick={savePaymentSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Payment Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
