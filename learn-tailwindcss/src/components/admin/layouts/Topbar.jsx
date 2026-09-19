import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { menuItems } from '../data/menuItems';
import ThemeToggle from '../../Navbar/ThemeToggle';
import Avatar from '../../Profile/Avatar';
import { useAuthStore } from '../../../store/authStore';

const Topbar = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const currentPage = menuItems.find((item) => item.path === location.pathname);

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-6">
      {/* Botón hamburguesa (solo móvil) */}
      <div className="flex-none lg:hidden">
        <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
          <Menu size={22} />
        </label>
      </div>

      {/* Título */}
      <div className="flex-1">
        <h1 className="text-xl font-bold">{currentPage?.title || 'Administración'}</h1>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Avatar name={user.username} w={42} h={42} props="text-xl" />

        <div className="hidden md:block">
          <p className="font-semibold">Leandro</p>
          <p className="text-sm opacity-70">Administrador</p>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
