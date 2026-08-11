import { LayoutDashboard, ClipboardList, Package, FolderTree, Users, Settings } from 'lucide-react';

export const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    title: 'Pedidos',
    icon: ClipboardList,
    path: '/admin/orders',
  },
  {
    title: 'Productos',
    icon: Package,
    path: '/admin/products',
  },
  {
    title: 'Categorías',
    icon: FolderTree,
    path: '/admin/categories',
  },
  {
    title: 'Usuarios',
    icon: Users,
    path: '/admin/users',
  },
  {
    title: 'Configuración',
    icon: Settings,
    path: '/admin/settings',
  },
];
