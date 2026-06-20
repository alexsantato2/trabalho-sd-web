import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RouterLayout';
import NotFound from '../pages/NotFound';
import Home from '../pages/Home';
import About from '../pages/About';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProductFormPage from '../pages/admin/AdminProductFormPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminCarouselPage from '../pages/admin/AdminCarouselPage';
import { CarouselAdminProvider } from '../contexts/CarouselAdminContext';
import CarouselDetailPage from '../pages/admin/Carousel/CarouselDetailPage'; // <-- Adicione o import da sua página nova
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import ProfilePage from '../pages/ProfilePage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'orders', element: <OrderHistoryPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'products', element: <AdminProductsPage /> },
              { path: 'products/new', element: <AdminProductFormPage /> },
              { path: 'products/:id/edit', element: <AdminProductFormPage /> },
              { path: 'orders', element: <AdminOrdersPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              
              /* Vitrinas / Carrossel: Envelopamos ambas as rotas no mesmo Provider 
                para que o rascunho local e histórico persistam durante a edição do item.
              */
              {
                path: 'carousel',
                element: <CarouselAdminProvider />, // O Provider serve como escopo para as rotas filhas
                children: [
                  { index: true, element: <AdminCarouselPage /> },      // /admin/carousel
                  { path: ':id', element: <CarouselDetailPage /> },     // /admin/carousel/:id
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);