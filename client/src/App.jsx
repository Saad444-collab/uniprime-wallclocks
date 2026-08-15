import { Routes, Route } from 'react-router';
import { useEffect, lazy, Suspense } from 'react';
import AOS from 'aos';
import './aos.css';
import { useTheme } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./admin/AdminProducts'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminCategories = lazy(() => import('./admin/AdminCategories'));
const AdminReviews = lazy(() => import('./admin/AdminReviews'));
const AdminPayments = lazy(() => import('./admin/AdminPayments'));
const AdminPaymentSettings = lazy(() => import('./admin/AdminPaymentSettings'));
const AdminCoupons = lazy(() => import('./admin/AdminCoupons'));
const AdminContact = lazy(() => import('./admin/AdminContact'));
const EasypaisaPayment = lazy(() => import('./pages/EasypaisaPayment'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="clock-loader"></div>
    </div>
  );
}

const wrap = (node) => <Suspense fallback={<PageLoader />}>{node}</Suspense>;

export default function App() {
  const { theme } = useTheme();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-500 text-white' : 'bg-[#F5F3EF] text-gray-900'}`}>
      <Navbar />
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={wrap(<Home />)} />
        <Route path="/products" element={wrap(<Products />)} />
        <Route path="/products/:slug" element={wrap(<ProductDetail />)} />
        <Route path="/cart" element={wrap(<Cart />)} />
        <Route path="/login" element={wrap(<Login />)} />
        <Route path="/register" element={wrap(<Register />)} />
        <Route path="/wishlist" element={wrap(<WishlistPage />)} />
        <Route path="/checkout" element={wrap(<ProtectedRoute><Checkout /></ProtectedRoute>)} />
        <Route path="/easypaisa-payment/:orderId" element={wrap(<ProtectedRoute><EasypaisaPayment /></ProtectedRoute>)} />
        <Route path="/profile" element={wrap(<ProtectedRoute><Profile /></ProtectedRoute>)} />
        <Route path="/forgot-password" element={wrap(<ForgotPassword />)} />
        <Route path="/reset-password" element={wrap(<ResetPassword />)} />
        <Route path="/verify-email" element={wrap(<VerifyEmail />)} />
        <Route path="/terms-and-conditions" element={wrap(<TermsAndConditions />)} />
        <Route path="/privacy-policy" element={wrap(<PrivacyPolicy />)} />
        <Route path="/about" element={wrap(<AboutUs />)} />
        <Route path="/contact" element={wrap(<ContactUs />)} />
        <Route path="/faq" element={wrap(<FAQ />)} />

        <Route path="/admin" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/products" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/orders" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/users" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/categories" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/reviews" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminReviews /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/payments" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminPayments /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/payment-settings" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminPaymentSettings /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/coupons" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminCoupons /></AdminLayout></ProtectedRoute>)} />
        <Route path="/admin/contact" element={wrap(<ProtectedRoute adminOnly><AdminLayout><AdminContact /></AdminLayout></ProtectedRoute>)} />
        <Route path="*" element={wrap(<NotFound />)} />
      </Routes>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}