import { NavLink } from 'react-router-dom';
import { menuItems } from '../data/menuItems';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="drawer-side">
      <label htmlFor="admin-drawer" className="drawer-overlay"></label>

      <aside className="w-64 min-h-full bg-base-200 border-r border-base-300 flex flex-col">
        <div className="p-5 border-b border-base-300">
          <h2 className="text-xl font-bold">Panel Administrativo</h2>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost w-full justify-start gap-3 text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={20} />
          Volver al sitio
        </button>

        <ul className="menu flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg ${isActive ? 'active font-semibold' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto pt-4 border-t border-base-300">
          <button onClick={logout} className="btn btn-ghost w-full justify-start gap-3">
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
