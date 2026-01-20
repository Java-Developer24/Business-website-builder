import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      icon: DollarSign,
      description: 'Last 30 days',
      trend: '+12.5%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Products',
      value: '5',
      icon: Package,
      description: 'Active products',
      trend: '+2 new',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Orders',
      value: '24',
      icon: ShoppingCart,
      description: 'Total orders',
      trend: '+8 this week',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Appointments',
      value: '12',
      icon: Calendar,
      description: 'Scheduled',
      trend: '+3 today',
      trendUp: true,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Customers',
      value: '156',
      icon: Users,
      description: 'Total customers',
      trend: '+23 this month',
      trendUp: true,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      icon: TrendingUp,
      description: 'From visitors',
      trend: '+0.4%',
      trendUp: true,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  const recentOrders = [
    { id: '1', customer: 'John Doe', product: 'Wireless Headphones', amount: '$199.99', status: 'completed' },
    { id: '2', customer: 'Jane Smith', product: 'Smart Watch', amount: '$299.99', status: 'processing' },
    { id: '3', customer: 'Bob Johnson', product: 'T-Shirt', amount: '$29.99', status: 'pending' },
  ];

  const upcomingAppointments = [
    { id: '1', customer: 'Alice Brown', service: 'Haircut', time: 'Today, 2:00 PM', status: 'confirmed' },
    { id: '2', customer: 'Charlie Davis', service: 'Massage', time: 'Today, 4:30 PM', status: 'confirmed' },
    { id: '3', customer: 'Diana Wilson', service: 'Consultation', time: 'Tomorrow, 10:00 AM', status: 'pending' },
  ];

  const quickActions = [
    { title: 'Add Product', href: '/admin/products/new', icon: Package, color: 'bg-blue-500' },
    { title: 'Add Service', href: '/admin/services/new', icon: Calendar, color: 'bg-purple-500' },
    { title: 'New Order', href: '/admin/orders', icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'View Customers', href: '/admin/customers', icon: Users, color: 'bg-orange-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4" style={{ borderTopColor: stat.color.replace('text-', '#') }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stat.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Button variant="outline" className="w-full h-auto flex-col gap-3 py-8 hover:scale-105 hover:shadow-lg transition-all duration-200 border-2">
                    <div className={`p-4 rounded-xl ${action.color} shadow-md`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="font-semibold text-base">{action.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm" className="font-medium">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all">
                  <div className="flex-1">
                    <div className="font-semibold text-base">{order.customer}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{order.product}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{order.amount}</div>
                    <Badge className={`${getStatusColor(order.status)} mt-1 font-medium`} variant="secondary">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">Upcoming Appointments</CardTitle>
                <CardDescription>Scheduled services</CardDescription>
              </div>
              <Link to="/admin/appointments">
                <Button variant="ghost" size="sm" className="font-medium">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all">
                  <div className="flex-1">
                    <div className="font-semibold text-base">{appointment.customer}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{appointment.service}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{appointment.time}</div>
                    <Badge className={`${getStatusColor(appointment.status)} mt-1 font-medium`} variant="secondary">
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
