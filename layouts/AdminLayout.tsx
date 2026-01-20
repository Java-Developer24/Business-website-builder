import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Store,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  Tag,
  Calendar,
  Briefcase,
  Users,
  UserCog,
  Mail,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Store',
    icon: Store,
    children: [
      { title: 'Products', href: '/admin/products', icon: Package },
      { title: 'Categories', href: '/admin/categories', icon: FolderTree },
      { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { title: 'Payments', href: '/admin/payments', icon: CreditCard },
      { title: 'Coupons', href: '/admin/coupons', icon: Tag },
    ],
  },
  {
    title: 'Appointments',
    icon: Calendar,
    children: [
      { title: 'Services', href: '/admin/services', icon: Briefcase },
      { title: 'Calendar', href: '/admin/appointments', icon: Calendar },
      { title: 'Staff', href: '/admin/staff', icon: UserCog },
    ],
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Marketing',
    icon: Mail,
    children: [
      { title: 'Email Logs', href: '/admin/emails', icon: Mail },
      { title: 'Templates', href: '/admin/email-templates', icon: Mail },
    ],
  },
  {
    title: 'Website',
    icon: Globe,
    children: [
      { title: 'Pages', href: '/admin/pages', icon: Globe },
      { title: 'Navigation', href: '/admin/navigation', icon: Globe },
      { title: 'Themes', href: '/admin/themes', icon: Globe },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Branding', href: '/admin/settings/branding', icon: Settings },
      { title: 'General', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const isParentActive = (item: NavItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r bg-card transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          {!collapsed && <h1 className="font-bold text-lg">Business Platform</h1>}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start',
                        collapsed && 'justify-center',
                        isParentActive(item) && 'bg-accent'
                      )}
                      onClick={() => !collapsed && toggleExpanded(item.title)}
                    >
                      <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              expandedItems.includes(item.title) && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </Button>
                    {!collapsed && expandedItems.includes(item.title) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.href} to={child.href!}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'w-full justify-start',
                                isActive(child.href) && 'bg-accent'
                              )}
                            >
                              <child.icon className="h-4 w-4 mr-2" />
                              {child.title}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.href!}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start',
                        collapsed && 'justify-center',
                        isActive(item.href) && 'bg-accent'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                      {!collapsed && item.title}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn('w-full', collapsed ? 'px-2' : 'justify-start')}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="ml-2 flex-1 text-left">
                    <p className="text-sm font-medium">
                      {user?.firstName || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
