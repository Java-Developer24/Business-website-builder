import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ShoppingCart, Calendar, Users, Mail, FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyProducts({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-12 w-12" />}
      title="No products yet"
      description="Get started by creating your first product. Add details, images, and pricing to start selling."
      action={
        onAdd
          ? {
              label: 'Add Product',
              onClick: onAdd,
            }
          : undefined
      }
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-12 w-12" />}
      title="No orders yet"
      description="When customers place orders, they will appear here. You'll be able to track and manage all orders from this page."
    />
  );
}

export function EmptyAppointments({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="h-12 w-12" />}
      title="No appointments scheduled"
      description="Start booking appointments with your customers. Schedule services and manage your calendar efficiently."
      action={
        onAdd
          ? {
              label: 'New Appointment',
              onClick: onAdd,
            }
          : undefined
      }
    />
  );
}

export function EmptyCustomers() {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="No customers yet"
      description="Your customer list is empty. Customers will appear here when they register or place orders."
    />
  );
}

export function EmptyEmails() {
  return (
    <EmptyState
      icon={<Mail className="h-12 w-12" />}
      title="No emails sent"
      description="Email logs will appear here when you send notifications to customers. Configure your email settings to get started."
    />
  );
}

export function EmptyPages({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-12 w-12" />}
      title="No pages created"
      description="Create custom pages for your website. Add content, images, and customize the layout to match your brand."
      action={
        onAdd
          ? {
              label: 'Create Page',
              onClick: onAdd,
            }
          : undefined
      }
    />
  );
}

export function EmptyServices({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="h-12 w-12" />}
      title="No services available"
      description="Add services that customers can book. Define pricing, duration, and availability for each service."
      action={
        onAdd
          ? {
              label: 'Add Service',
              onClick: onAdd,
            }
          : undefined
      }
    />
  );
}

export function EmptyCategories({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-12 w-12" />}
      title="No categories yet"
      description="Organize your products and services with categories. Create categories to help customers find what they need."
      action={
        onAdd
          ? {
              label: 'Add Category',
              onClick: onAdd,
            }
          : undefined
      }
    />
  );
}
