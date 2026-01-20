import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import AiroErrorBoundary from '../dev-tools/src/AiroErrorBoundary';
import RootLayout from './layouts/RootLayout';
import { routes } from './routes';
import Spinner from './components/Spinner';
import { AuthProvider } from './lib/auth-context';
import { CartProvider } from './lib/cart-context';
import { ErrorBoundary } from './components/ErrorBoundary';

const SpinnerFallback = () => (
  <div className="flex justify-center py-8 h-screen items-center">
    <Spinner />
  </div>
);

// Create router with layout wrapper
const router = createBrowserRouter([
  {
    path: '/',
    element: import.meta.env.DEV ? (
      <AiroErrorBoundary>
        <Suspense fallback={<SpinnerFallback />}>
          <AuthProvider>
            <CartProvider>
              <RootLayout>
                <Outlet />
              </RootLayout>
            </CartProvider>
          </AuthProvider>
        </Suspense>
      </AiroErrorBoundary>
    ) : (
      <ErrorBoundary>
        <Suspense fallback={<SpinnerFallback />}>
          <AuthProvider>
            <CartProvider>
              <RootLayout>
                <Outlet />
              </RootLayout>
            </CartProvider>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    ),
    children: routes,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
