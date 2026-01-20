import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PageSection {
  id: string;
  type: 'hero' | 'features' | 'content' | 'gallery' | 'cta' | 'contact';
  title?: string;
  content?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: any[];
}

export default function NewPagePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState({
    slug: '',
    title: '',
    description: '',
    isPublished: false,
    sections: [] as PageSection[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPage({ ...page, [e.target.name]: e.target.value });
  };

  const handleSlugGenerate = () => {
    const slug = page.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setPage({ ...page, slug });
  };

  const handleAddSection = () => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      type: 'content',
      title: '',
      content: '',
    };
    setPage({ ...page, sections: [...page.sections, newSection] });
  };

  const handleRemoveSection = (id: string) => {
    setPage({ ...page, sections: page.sections.filter((s) => s.id !== id) });
  };

  const handleSectionChange = (id: string, field: string, value: any) => {
    setPage({
      ...page,
      sections: page.sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };

  const handleSave = async () => {
    if (!page.slug || !page.title) {
      toast.error('Slug and title are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });

      if (response.ok) {
        toast.success('Page created successfully');
        navigate('/admin/pages');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create page');
      }
    } catch (error: any) {
      console.error('Error creating page:', error);
      toast.error(error.message || 'Failed to create page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/pages')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Page</h1>
          <p className="text-muted-foreground">Create a new website page</p>
        </div>
      </div>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Page Settings</CardTitle>
          <CardDescription>Basic information about your page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={page.title}
              onChange={handleChange}
              placeholder="About Us"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                name="slug"
                value={page.slug}
                onChange={handleChange}
                placeholder="about-us"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSlugGenerate}>
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">URL: /{page.slug || 'your-slug'}</p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={page.description}
              onChange={handleChange}
              placeholder="Page description for SEO"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublished">Published</Label>
              <p className="text-sm text-muted-foreground">Make this page visible to the public</p>
            </div>
            <Switch
              id="isPublished"
              checked={page.isPublished}
              onCheckedChange={(checked) => setPage({ ...page, isPublished: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Page Sections */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Page Sections</CardTitle>
              <CardDescription>Build your page with sections</CardDescription>
            </div>
            <Button onClick={handleAddSection}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {page.sections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No sections yet. Click "Add Section" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {page.sections.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Section {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Section Type</Label>
                      <Select
                        value={section.type}
                        onValueChange={(value) => handleSectionChange(section.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="features">Features</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="gallery">Gallery</SelectItem>
                          <SelectItem value="cta">Call to Action</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Title</Label>
                      <Input
                        value={section.title || ''}
                        onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                        placeholder="Section title"
                      />
                    </div>

                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={section.content || ''}
                        onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                        placeholder="Section content"
                        rows={4}
                      />
                    </div>

                    {(section.type === 'hero' || section.type === 'cta') && (
                      <>
                        <div>
                          <Label>Button Text</Label>
                          <Input
                            value={section.buttonText || ''}
                            onChange={(e) =>
                              handleSectionChange(section.id, 'buttonText', e.target.value)
                            }
                            placeholder="Learn More"
                          />
                        </div>
                        <div>
                          <Label>Button Link</Label>
                          <Input
                            value={section.buttonLink || ''}
                            onChange={(e) =>
                              handleSectionChange(section.id, 'buttonLink', e.target.value)
                            }
                            placeholder="/contact"
                          />
                        </div>
                      </>
                    )}

                    {(section.type === 'hero' || section.type === 'gallery') && (
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={section.image || ''}
                          onChange={(e) => handleSectionChange(section.id, 'image', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Page
            </>
          )}
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/pages')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
