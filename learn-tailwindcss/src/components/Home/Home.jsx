import Hero from './Hero';
import Menu from './Menu';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const timer = setTimeout(() => {
      const element = document.getElementById(location.hash.replace('#', ''));

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
        });

        window.history.replaceState(null, '', location.pathname);
      }
    }, 1000); // Espera 1 segundo para asegurarse de que el elemento esté renderizado

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <Hero />
      <Menu />
    </>
  );
};

export default Home;
