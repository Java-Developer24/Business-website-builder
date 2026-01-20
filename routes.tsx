import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import ContactPage from './pages/contact';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import AdminDashboard from './pages/admin/index';
import AdminProductsPage from './pages/admin/products/index';
import NewProductPage from './pages/admin/products/new';
import ServicesPage from './pages/admin/services/index';
import NewServicePage from './pages/admin/services/new';
import AppointmentsPage from './pages/admin/appointments/index';
import NewAppointmentPage from './pages/admin/appointments/new';
import CategoriesPage from './pages/admin/categories/index';
import NewCategoryPage from './pages/admin/categories/new';
import OrdersPage from './pages/admin/orders/index';
import OrderDetailPage from './pages/admin/orders/[orderId]';
import PaymentsPage from './pages/admin/payments/index';
import PaymentSuccessPage from './pages/payment-success';
import PaymentCancelPage from './pages/payment-cancel';
import EmailLogsPage from './pages/admin/emails/index';
import EmailTemplatesPage from './pages/admin/email-templates/index';
import NavigationPage from './pages/admin/navigation/index';
import ThemesPage from './pages/admin/themes/index';
import BrandingSettingsPage from './pages/admin/settings/branding';
import GeneralSettingsPage from './pages/admin/settings/general';
import PagesListPage from './pages/admin/pages/index';
import NewPagePage from './pages/admin/pages/new';
import CustomersPage from './pages/admin/customers/index';
import CustomerDetailPage from './pages/admin/customers/[customerId]';
import CustomerDashboard from './pages/customer/dashboard';
import ProductsPage from './pages/shop/products';
import ProductDetailPage from './pages/shop/products/[productId]';
import ServicesPublicPage from './pages/shop/services';
import ServiceDetailPage from './pages/shop/services/[serviceId]';
import CartPage from './pages/cart';
import CheckoutPage from './pages/checkout';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Lazy load components for code splitting
const isDevelopment = (import.meta.env as any).DEV;
const NotFoundPage = isDevelopment
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : lazy(() => import('./pages/_404'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <AdminProductsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/products/new',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <NewProductPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/services',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <ServicesPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/services/new',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <NewServicePage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/appointments',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <AppointmentsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/appointments/new',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <NewAppointmentPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/categories',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <CategoriesPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/categories/new',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <NewCategoryPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <OrdersPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/orders/:orderId',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <OrderDetailPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/payments',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <PaymentsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/emails',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <EmailLogsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/email-templates',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
        <AdminLayout>
          <EmailTemplatesPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/navigation',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <NavigationPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/themes',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <ThemesPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings/branding',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <BrandingSettingsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/pages',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <PagesListPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/pages/new',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <NewPagePage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/customers',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <CustomersPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <GeneralSettingsPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/customers/:customerId',
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <CustomerDetailPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/dashboard',
    element: (
      <ProtectedRoute requiredRoles={['CUSTOMER']}>
        <CustomerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/shop/products',
    element: <ProductsPage />,
  },
  {
    path: '/shop/products/:productId',
    element: <ProductDetailPage />,
  },
  {
    path: '/shop/services',
    element: <ServicesPublicPage />,
  },
  {
    path: '/shop/services/:serviceId',
    element: <ServiceDetailPage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/payment/success',
    element: <PaymentSuccessPage />,
  },
  {
    path: '/payment/cancel',
    element: <PaymentCancelPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Types for type-safe navigation
export type Path = '/' | '/login' | '/register' | '/admin';

export type Params = Record<string, string | undefined>;
