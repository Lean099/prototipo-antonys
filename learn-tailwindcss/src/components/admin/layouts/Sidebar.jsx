import { NavLink } from 'react-router-dom';
import { menuItems } from '../data/menuItems';

const Sidebar = () => {
  return (
    <div className="drawer-side">
      <label htmlFor="admin-drawer" className="drawer-overlay"></label>

      <aside className="w-72 min-h-full bg-base-100 border-r flex flex-col">
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">Panel Administrativo</h2>
        </div>

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

        <div className="border-t p-4">Acá irán los botones inferiores</div>
      </aside>
    </div>
  );
};

export default Sidebar;
