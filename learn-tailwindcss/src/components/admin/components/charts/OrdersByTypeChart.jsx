import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#16a34a', '#f59e0b'];

const OrdersByTypeChart = ({ data }) => {
  const chartData = [
    {
      name: 'Delivery',
      value: data.delivery,
    },
    {
      name: 'Retiro en el local',
      value: data.pickup,
    },
    {
      name: 'En mesa',
      value: data.table,
    },
  ];

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="card bg-base-100 border shadow-sm">
      <div className="card-body">
        <h3 className="font-semibold text-lg">Pedidos por tipo</h3>

        <p className="text-sm opacity-60">Distribución de pedidos según su modalidad</p>

        {total > 0 ? (
          <div className="w-full h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip formatter={(value) => [value, 'Pedidos']} />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <p className="text-sm opacity-60">Todavía no hay pedidos registrados en este período.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersByTypeChart;
