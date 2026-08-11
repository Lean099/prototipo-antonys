import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Products from '../pages/Products';
import Categories from '../pages/Categories';
import Users from '../pages/Users';
import Settings from '../pages/Settings';

function AdminLayout() {
  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 bg-base-200">
          <Outlet />
        </main>
      </div>

      <Sidebar />
    </div>
  );
}

export default AdminLayout;
