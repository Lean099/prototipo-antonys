import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TopProductsChart = ({ data }) => {
  const chartData = [...data]
    .sort((a, b) => b.units_sold - a.units_sold)
    .slice(0, 5)
    .map((product) => ({
      name: product.product_name,
      unidades: product.units_sold,
      total: product.total_sold,
    }));

  return (
    <div className="card bg-base-100 border shadow-sm">
      <div className="card-body">
        <h3 className="font-semibold text-lg">Productos más vendidos</h3>

        <p className="text-sm opacity-60">Top 5 de productos por unidades vendidas</p>

        {chartData.length > 0 ? (
          <div className="w-full h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                <XAxis type="number" allowDecimals={false} />

                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />

                <Tooltip
                  formatter={(value, name, props) => {
                    if (name === 'unidades') {
                      return [`${value} unidades`, 'Vendidas'];
                    }

                    return [`$${Number(props.payload.total).toLocaleString('es-AR')}`, 'Total vendido'];
                  }}
                />

                <Bar dataKey="unidades" fill="var(--color-primary)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <p className="text-sm opacity-60">Todavía no hay productos vendidos en este período.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
