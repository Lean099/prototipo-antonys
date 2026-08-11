import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { useThemeStore } from './store/useThemeStore';
import { useBackendStatusStore } from './store/useBackendStatusStore';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Checkout from './components/Checkout/Checkout';
import Contact from './components/Contact';
import Profile from './components/Profile/Profile';
import Orders from './components/Orders';
import Footer from './components/Footer';
import ProtectedRoute from './routes/ProtectedRoutes';
import ScrollToTop from './components/ScrollToTop';
import BackendAlert from './components/BackendAlert';
import ModalLogin from './components/Navbar/ModalLogin';
import ModalSignUp from './components/Navbar/ModalSignup';
import DeleteAddressModal from './components/Profile/DeleteAddressModal';
import AppContent from './components/AppContent.jsx';

// PROBANDO RCLONE

function App() {
  const theme = useThemeStore((state) => state.theme);
  //const { setStatus } = useBackendStatusStore();  BACKEND MONITOR
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Backend monitor
  /*useEffect(() => {
    const checkBackend = async () => {
      const controller = new AbortController()

      const timeout = setTimeout(() => {
        controller.abort()
      }, 4000)

      try {
        const res = await fetch(
          `${API_URL}/health`,
          {
            signal: controller.signal,
          }
        )

        clearTimeout(timeout)

        if (res.ok) {
          setStatus("online")
        } else {
          setStatus("offline")
        }
      } catch (error) {
        clearTimeout(timeout)

        setStatus("offline")
      }
    }

    // primer check
    checkBackend()

    // cada 5 segundos
    const interval = setInterval(checkBackend, 5000)

    return () => clearInterval(interval)
  }, [])*/

  return (
    <BrowserRouter>
      {/*<BackendAlert/>*/}
      <AppContent />
      <ModalLogin />
      <ModalSignUp />
      <DeleteAddressModal />
      <ScrollToTop />
    </BrowserRouter>
  );
}

export default App;
