import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  // Auto-detect variant from status if not provided
  const detectedVariant = variant || detectVariant(status);
  
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 font-medium border',
        variantStyles[detectedVariant],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[detectedVariant])} />
      {status}
    </Badge>
  );
}

function detectVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const statusLower = status.toLowerCase();
  
  if (['completed', 'confirmed', 'delivered', 'published', 'active', 'success'].includes(statusLower)) {
    return 'success';
  }
  
  if (['pending', 'processing', 'draft', 'scheduled'].includes(statusLower)) {
    return 'warning';
  }
  
  if (['failed', 'cancelled', 'refunded', 'rejected', 'inactive'].includes(statusLower)) {
    return 'error';
  }
  
  if (['shipped', 'in_transit', 'info'].includes(statusLower)) {
    return 'info';
  }
  
  return 'default';
}
