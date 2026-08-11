import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer';
import Home from './Home/Home';
import Checkout from './Checkout/Checkout';
import Contact from './Contact';
import Profile from './Profile/Profile';
import Orders from './Orders';
import ProtectedRoute from './../routes/ProtectedRoutes';
import AdminLayout from './admin/layouts/AdminLayouts';
import ModalLogin from './Navbar/ModalLogin';
import ModalSignUp from './Navbar/ModalSignUp';
import DeleteAddressModal from './Profile/DeleteAddressModal';
import ScrollToTop from './ScrollToTop';
import Dashboard from './admin/pages/Dashboard';
import Products from './admin/pages/Products';
import Categories from './admin/pages/Categories';
import Users from './admin/pages/Users';
import Settings from './admin/pages/Settings';
import ProductModal from './admin/modals/ProductModal';
import DeleteProductModal from './admin/modals/DeleteProductModal';

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}

      <Routes>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contacto" element={<Contact />} />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isAdmin && <Footer />}

      <ModalLogin />
      <ModalSignUp />
      <DeleteAddressModal />
      <ProductModal />
      <DeleteProductModal />
      <ScrollToTop />
    </>
  );
};

export default AppContent;
