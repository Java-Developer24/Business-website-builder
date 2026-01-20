import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'order' | 'appointment' | 'welcome' | 'custom';
  variables: string[];
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Order Confirmation',
    subject: 'Order Confirmation - Order #{{orderNumber}}',
    body: `Hi {{customerName}},\n\nThank you for your order!\n\nOrder Number: {{orderNumber}}\nTotal: {{orderTotal}}\n\nWe'll send you another email when your order ships.\n\nBest regards,\nThe Team`,
    type: 'order',
    variables: ['customerName', 'orderNumber', 'orderTotal'],
  },
  {
    id: '2',
    name: 'Appointment Confirmation',
    subject: 'Appointment Confirmed - {{serviceName}}',
    body: `Hi {{customerName}},\n\nYour appointment has been confirmed!\n\nService: {{serviceName}}\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nProvider: {{providerName}}\n\nSee you soon!\n\nBest regards,\nThe Team`,
    type: 'appointment',
    variables: ['customerName', 'serviceName', 'appointmentDate', 'appointmentTime', 'providerName'],
  },
  {
    id: '3',
    name: 'Welcome Email',
    subject: 'Welcome to Business Platform!',
    body: `Hi {{customerName}},\n\nWelcome to Business Platform! We're excited to have you.\n\nYou can now:\n- Browse our products\n- Book services\n- Track your orders\n- Manage your account\n\nIf you have any questions, feel free to reach out.\n\nBest regards,\nThe Team`,
    type: 'welcome',
    variables: ['customerName'],
  },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const handleSave = () => {
    if (editingTemplate) {
      if (editingTemplate.id === 'new') {
        // Create new template
        const newTemplate = {
          ...editingTemplate,
          id: Date.now().toString(),
        };
        setTemplates([...templates, newTemplate]);
        toast.success('Template created successfully');
      } else {
        // Update existing template
        setTemplates(templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t)));
        toast.success('Template updated successfully');
      }
      setEditingTemplate(null);
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success('Template deleted');
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      id: 'new',
      name: '',
      subject: '',
      body: '',
      type: 'custom',
      variables: [],
    });
    setIsCreating(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-500';
      case 'appointment':
        return 'bg-green-500';
      case 'welcome':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (editingTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{isCreating ? 'Create Template' : 'Edit Template'}</h1>
            <p className="text-muted-foreground">Configure your email template</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Configure the template name, subject, and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  placeholder="e.g., Order Confirmation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={editingTemplate.type}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, type: e.target.value as EmailTemplate['type'] })
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="order">Order</option>
                  <option value="appointment">Appointment</option>
                  <option value="welcome">Welcome</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={editingTemplate.subject}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                placeholder="Use {{variables}} for dynamic content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={editingTemplate.body}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                placeholder="Use {{variables}} for dynamic content"
                rows={12}
              />
            </div>

            <Alert>
              <AlertDescription>
                <strong>Available Variables:</strong> Use double curly braces to insert dynamic content. Common
                variables: customerName, orderNumber, orderTotal, serviceName, appointmentDate
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (previewTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Template Preview</h1>
            <p className="text-muted-foreground">{previewTemplate.name}</p>
          </div>
          <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>This is how your email will look (with sample data)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <div className="text-sm text-muted-foreground mb-1">Subject:</div>
              <div className="font-semibold">{previewTemplate.subject.replace(/{{\w+}}/g, '[Sample Data]')}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Body:</div>
              <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {previewTemplate.body.replace(/{{\w+}}/g, '[Sample Data]')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage your automated email templates</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="mt-2">{template.subject}</CardDescription>
                </div>
                <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)} className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">Create your first email template to get started</p>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
