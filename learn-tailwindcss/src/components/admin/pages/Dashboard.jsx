import { useEffect, useState } from 'react';
import { ClipboardList, DollarSign, Package, Users, Download } from 'lucide-react';

import StatCard from '../components/StatCard';
import { useThemeStore } from '../../../store/useThemeStore';

import {
  getDashboardSummary,
  getBusinessDaySummary,
  getDashboardOrders,
  getDashboardUsers,
  getDashboardProducts,
  getBusinessWeekSummary,
  downloadDashboardExcel,
} from '../services/dashboardService';

import OrdersByStatusChart from '../components/charts/OrdersByStatusChart';
import PaymentMethodsChart from '../components/charts/PaymentMethodsChart';
import TopProductsChart from '../components/charts/TopProductsChart';
import OrdersByTypeChart from '../components/charts/OrdersByTypeChart';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [businessDay, setBusinessDay] = useState(null);
  const [orders, setOrders] = useState(null);
  const [users, setUsers] = useState(null);
  const [products, setProducts] = useState(null);
  const [period, setPeriod] = useState('day');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const periodLabel = period === 'day' ? 'jornada' : 'semana';
  const [exporting, setExporting] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  const handleExportExcel = async () => {
    try {
      setExporting(true);

      await downloadDashboardExcel(period);
    } catch (error) {
      console.error('Error al exportar el Dashboard:', error);
      alert('No se pudo generar el archivo Excel. Intentá nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Elegir el resumen comercial según el período
        const businessSummaryRequest = period === 'day' ? getBusinessDaySummary() : getBusinessWeekSummary();

        const [summaryData, businessSummaryData, ordersData, usersData, productsData] = await Promise.all([
          getDashboardSummary(),
          businessSummaryRequest,
          getDashboardOrders(period),
          getDashboardUsers(period),
          getDashboardProducts(period),
        ]);

        setSummary(summaryData);
        setBusinessDay(businessSummaryData);
        setOrders(ordersData);
        setUsers(usersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error al cargar el Dashboard:', error);
        setError('No se pudo cargar la información del Dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  if (loading) {
    return <p>Cargando Dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const formatPeriodDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires',
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        {/* Título y período */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>

          {businessDay?.period && (
            <p className="text-sm opacity-70 mt-2">
              Período: {formatPeriodDate(businessDay.period.start)}
              {' — '}
              {formatPeriodDate(businessDay.period.end)}
            </p>
          )}
        </div>

        {/* Selector y exportación */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="join">
            <button
              className={`join-item btn ${period === 'day' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriod('day')}
            >
              Jornada
            </button>

            <button
              className={`join-item btn ${period === 'week' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriod('week')}
            >
              Semana
            </button>
          </div>

          <button
            className={`btn ${theme === 'cupcake' ? 'btn-neutral' : 'btn-primary'}`}
            onClick={handleExportExcel}
            disabled={exporting}
          >
            <Download size={18} />
            {exporting ? 'Exportando...' : 'Exportar a Excel'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={`Pedidos de ${period === 'day' ? 'la jornada' : 'la semana'}`}
          value={businessDay.orders.total}
          icon={ClipboardList}
        />

        <StatCard
          title={`Ventas de ${period === 'day' ? 'la jornada' : 'la semana'}`}
          value={`$${businessDay.sales.total.toLocaleString('es-AR')}`}
          icon={DollarSign}
        />

        <StatCard title="Productos" value={summary.products} icon={Package} />

        <StatCard title="Clientes activos" value={summary.users.active_customers} icon={Users} />
      </div>

      {/* Resumen de pedidos */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-5">Resumen de pedidos</h2>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pedidos por estado */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-3">Por estado</h3>

              <div className="space-y-3">
                {[
                  ['Pendientes', orders.by_status.pending],
                  ['Confirmados', orders.by_status.confirmed],
                  ['Preparando', orders.by_status.preparing],
                  ['Listos', orders.by_status.ready],
                  ['En camino', orders.by_status.on_the_way],
                  ['Entregados', orders.by_status.delivered],
                  ['Cancelados', orders.by_status.cancelled],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm opacity-70">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pedidos por tipo */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-3">Por tipo</h3>

              <div className="space-y-3">
                {[
                  ['Delivery', orders.by_type.delivery],
                  ['Retiro en el local', orders.by_type.pickup],
                  ['En mesa', orders.by_type.table],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm opacity-70">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pedidos por origen */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-3">Por origen</h3>

              <div className="space-y-3">
                {[
                  ['Clientes', orders.by_source.customer],
                  ['Empleados', orders.by_source.employee],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm opacity-70">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen de ventas */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-5">Resumen de ventas</h2>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Total de ventas */}
          <div className="card bg-base-100 border shadow-sm lg:col-span-1">
            <div className="card-body justify-center">
              <p className="text-sm opacity-70">Total de ventas</p>

              <h3 className="text-3xl font-bold text-base-content">
                ${businessDay.sales.total.toLocaleString('es-AR')}
              </h3>

              <p className="text-sm opacity-60">Jornada comercial</p>
            </div>
          </div>

          {/* Desglose de ventas */}
          <div className="card bg-base-100 border shadow-sm lg:col-span-2">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-3">Desglose de ventas</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Subtotal de productos</span>

                  <span className="font-semibold">${businessDay.sales.subtotal.toLocaleString('es-AR')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Cargos de envío</span>

                  <span className="font-semibold">${businessDay.sales.delivery_fee.toLocaleString('es-AR')}</span>
                </div>

                <div className="divider my-0"></div>

                <h4 className="font-semibold">Medios de pago</h4>

                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Efectivo</span>

                  <span className="font-semibold">${businessDay.payment_methods.cash.toLocaleString('es-AR')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">Transferencia</span>

                  <span className="font-semibold">
                    $
                    {(businessDay.payment_methods.transfer + businessDay.payment_methods.mercadopago).toLocaleString(
                      'es-AR',
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gráficos estadísticos */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-5">Gráficos estadísticos</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <OrdersByStatusChart data={orders.by_status} />

          <PaymentMethodsChart data={businessDay.payment_methods} />

          <TopProductsChart data={products.sales.products_ranking} />

          <OrdersByTypeChart data={orders.by_type} />
        </div>
      </section>

      {/* Estadísticas de productos */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-5">Estadísticas de productos</h2>

        {/* Estado del inventario */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <p className="text-sm opacity-70">Total de productos</p>
              <h3 className="text-3xl font-bold text-base-content">{products.products.total}</h3>
            </div>
          </div>

          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <p className="text-sm opacity-70">Productos disponibles</p>
              <h3 className="text-3xl font-bold text-success">{products.products.available}</h3>
            </div>
          </div>

          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <p className="text-sm opacity-70">Poco stock</p>
              <h3 className="text-3xl font-bold text-warning">{products.products.low_stock}</h3>
            </div>
          </div>

          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <p className="text-sm opacity-70">Sin stock</p>
              <h3 className="text-3xl font-bold text-error">{products.products.out_of_stock}</h3>
            </div>
          </div>
        </div>

        {/* Rankings de ventas */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Productos más vendidos */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg">Productos más vendidos</h3>

              <p className="text-sm opacity-60">Unidades vendidas durante la jornada</p>

              {products.sales.products_ranking.length > 0 ? (
                <div className="space-y-4 mt-3">
                  {products.sales.products_ranking.map((product, index) => (
                    <div key={product.product_id} className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold opacity-50">{index + 1}.</span>

                        <span className="text-sm font-medium truncate">{product.product_name}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-semibold">{product.units_sold} unidades</p>

                        <p className="text-xs opacity-60">${product.total_sold.toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-60 mt-3">Todavía no hay ventas registradas durante esta jornada.</p>
              )}
            </div>
          </div>

          {/* Tamaños más vendidos */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg">Tamaños más vendidos</h3>

              <p className="text-sm opacity-60">Unidades vendidas por tamaño</p>

              {products.sales.sizes_ranking.length > 0 ? (
                <div className="space-y-4 mt-3">
                  {products.sales.sizes_ranking.map((item, index) => (
                    <div key={`${item.product_id}-${item.size}`} className="flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.product_name}</p>

                        <p className="text-xs opacity-60">{item.size}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-semibold">{item.units_sold} unidades</p>

                        <p className="text-xs opacity-60">${item.total_sold.toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-60 mt-3">Todavía no hay ventas registradas durante esta jornada.</p>
              )}
            </div>
          </div>
        </div>

        {/* Productos sin ventas */}
        <div className="card bg-base-100 border shadow-sm mt-6">
          <div className="card-body">
            <div className="flex justify-between items-center gap-3">
              <h3 className="font-semibold text-lg">Productos sin ventas</h3>

              <span className="badge badge-neutral">{products.sales.without_sales_count}</span>
            </div>

            {products.sales.without_sales.length > 0 ? (
              <div className="space-y-3 mt-2">
                {products.sales.without_sales.map((product) => (
                  <div key={product.product_id} className="flex justify-between items-center gap-3">
                    <span className="text-sm">{product.product_name}</span>
                    <span className="text-xs opacity-60">Sin ventas</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-60 mt-2">Todos los productos registraron ventas durante esta jornada.</p>
            )}
          </div>
        </div>
      </section>

      {/* Estadísticas de usuarios */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-5">Usuarios</h2>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Clientes */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg">Clientes</h3>

              <p className="text-3xl font-bold text-base-content">{users.customers.total}</p>

              <p className="text-sm opacity-60">Clientes registrados</p>

              <div className="divider my-1"></div>

              <div className="flex justify-between">
                <span className="text-sm opacity-70">Activos</span>
                <span className="font-semibold">{users.customers.active}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm opacity-70">Inactivos</span>
                <span className="font-semibold">{users.customers.inactive}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm opacity-70">Nuevos en la jornada</span>
                <span className="font-semibold text-success">+{users.customers.new}</span>
              </div>
            </div>
          </div>

          {/* Empleados */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg">Empleados</h3>

              <p className="text-3xl font-bold text-base-content">{users.employees.total}</p>

              <p className="text-sm opacity-60">Empleados registrados</p>

              <div className="divider my-1"></div>

              <div className="flex justify-between">
                <span className="text-sm opacity-70">Nuevos en la jornada</span>
                <span className="font-semibold text-success">+{users.employees.new}</span>
              </div>
            </div>
          </div>

          {/* Administradores */}
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-lg">Administradores</h3>

              <p className="text-3xl font-bold text-base-content">{users.admins.total}</p>

              <p className="text-sm opacity-60">Administradores registrados</p>

              <div className="divider my-1"></div>

              <div className="flex justify-between">
                <span className="text-sm opacity-70">Nuevos en la jornada</span>
                <span className="font-semibold text-success">+{users.admins.new}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
