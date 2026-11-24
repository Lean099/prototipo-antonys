import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OrdersByStatusChart = ({ data }) => {
  const chartData = [
    { name: 'Pendientes', cantidad: data.pending },
    { name: 'Confirmados', cantidad: data.confirmed },
    { name: 'Preparando', cantidad: data.preparing },
    { name: 'Listos', cantidad: data.ready },
    { name: 'En camino', cantidad: data.on_the_way },
    { name: 'Entregados', cantidad: data.delivered },
    { name: 'Cancelados', cantidad: data.cancelled },
  ];

  return (
    <div className="card bg-base-100 border shadow-sm">
      <div className="card-body">
        <h3 className="font-semibold text-lg">Pedidos por estado</h3>

        <p className="text-sm opacity-60">Cantidad de pedidos según su estado</p>

        <div className="w-full h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

              <XAxis type="number" allowDecimals={false} />

              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />

              <Tooltip formatter={(value) => [value, 'Pedidos']} />

              <Bar dataKey="cantidad" fill="var(--color-primary)" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OrdersByStatusChart;
