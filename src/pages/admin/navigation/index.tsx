import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, GripVertical, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface NavItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

const defaultNavItems: NavItem[] = [
  { id: '1', label: 'Home', href: '/', order: 1 },
  { id: '2', label: 'Products', href: '/shop/products', order: 2 },
  { id: '3', label: 'Services', href: '/shop/services', order: 3 },
  { id: '4', label: 'About', href: '/about', order: 4 },
  { id: '5', label: 'Contact', href: '/contact', order: 5 },
];

export default function NavigationPage() {
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = () => {
    if (editingItem) {
      if (editingItem.id === 'new') {
        const newItem = {
          ...editingItem,
          id: Date.now().toString(),
          order: navItems.length + 1,
        };
        setNavItems([...navItems, newItem]);
        toast.success('Navigation item created');
      } else {
        setNavItems(navItems.map((item) => (item.id === editingItem.id ? editingItem : item)));
        toast.success('Navigation item updated');
      }
      setEditingItem(null);
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this navigation item?')) {
      setNavItems(navItems.filter((item) => item.id !== id));
      toast.success('Navigation item deleted');
    }
  };

  const handleCreateNew = () => {
    setEditingItem({
      id: 'new',
      label: '',
      href: '',
      order: navItems.length + 1,
    });
    setIsCreating(true);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...navItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, idx) => (item.order = idx + 1));

    setNavItems(newItems);
    toast.success('Navigation order updated');
  };

  if (editingItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{isCreating ? 'Create Navigation Item' : 'Edit Navigation Item'}</h1>
            <p className="text-muted-foreground">Configure navigation menu item</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Item
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Configure the navigation item label and link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={editingItem.label}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                placeholder="e.g., Products"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="href">Link (URL)</Label>
              <Input
                id="href"
                value={editingItem.href}
                onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                placeholder="e.g., /shop/products"
              />
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
          <h1 className="text-3xl font-bold">Navigation Menu</h1>
          <p className="text-muted-foreground">Manage your website navigation menu</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>Drag to reorder, or use the arrows to change the order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.href}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === navItems.length - 1}
                  >
                    ↓
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
