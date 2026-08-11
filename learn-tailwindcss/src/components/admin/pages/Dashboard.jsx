import { ClipboardList, DollarSign, Package, Users } from 'lucide-react';

import StatCard from '../components/StatCard';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pedidos pendientes" value="8" icon={ClipboardList} />

        <StatCard title="Ventas del día" value="$245.000" icon={DollarSign} />

        <StatCard title="Productos" value="58" icon={Package} />

        <StatCard title="Usuarios" value="126" icon={Users} />
      </div>
    </div>
  );
};

export default Dashboard;
