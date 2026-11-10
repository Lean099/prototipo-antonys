import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AdminOrderDetailModal from '../components/orders/AdminOrderDetailModal';
import AdminEditOrderModal from '../components/orders/AdminEditOrderModal';

const API_URL = import.meta.env.VITE_API_URL;

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'ready', label: 'Listo' },
  { value: 'on_the_way', label: 'En camino' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const STATUS_STYLES = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  preparing: 'badge-info',
  ready: 'badge-success',
  on_the_way: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-error',
};

const STATUS_LABELS = Object.fromEntries(ORDER_STATUSES.map(({ value, label }) => [value, label]));

const ORDER_TYPES = {
  delivery: 'Delivery',
  pickup: 'Retiro',
  table: 'Mesa',
};

const ORDER_SOURCES = {
  customer: 'Cliente',
  employee: 'Empleado',
};

const PAYMENT_METHODS = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  mercado_pago: 'Mercado Pago',
};

const PAYMENT_STATUSES = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
};

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const parseDate = (value) => {
  if (!value) return null;

  // Las fechas de SQLite pueden llegar sin información de zona horaria.
  // En ese caso, interpretamos el valor como UTC.
  const normalizedValue = typeof value === 'string' && !/(Z|[+-]\d{2}:\d{2})$/i.test(value) ? `${value}Z` : value;

  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) return '—';

  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const hasOrderBeenUpdated = (order) => {
  const createdAt = parseDate(order.created_at);
  const updatedAt = parseDate(order.updated_at);

  return Boolean(createdAt && updatedAt && updatedAt.getTime() > createdAt.getTime());
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState('');
  const [orderType, setOrderType] = useState('');
  const [orderSource, setOrderSource] = useState('');
  const [sort, setSort] = useState('newest');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const requestInProgress = useRef(false);

  const getOrders = useCallback(
    async ({ silent = false } = {}) => {
      // Evitamos solicitudes simultáneas.
      if (requestInProgress.current) return;

      requestInProgress.current = true;

      if (!silent) {
        setLoading(true);
        setError('');
      }

      try {
        const params = {
          page,
          limit: 10,
          sort,
        };

        if (status) params.status = status;
        if (orderType) params.order_type = orderType;
        if (orderSource) params.order_source = orderSource;

        const response = await axios.get(`${API_URL}/orders/adminGetOrders`, { params });

        setOrders(response.data.items ?? []);
        setTotal(response.data.total ?? 0);
        setTotalPages(Math.max(response.data.total_pages ?? 1, 1));

        if (silent) setError('');
      } catch (err) {
        console.error('Error al cargar pedidos:', err);

        // Una actualización automática fallida no borra la lista
        // que ya estaba visible.
        if (!silent) {
          setOrders([]);
          setTotal(0);
          setTotalPages(1);
          setError(err.response?.data?.detail ?? 'No se pudieron cargar los pedidos. Intentá nuevamente.');
        }
      } finally {
        requestInProgress.current = false;

        if (!silent) {
          setLoading(false);
        }
      }
    },
    [page, status, orderType, orderSource, sort],
  );

  useEffect(() => {
    getOrders();

    const intervalId = setInterval(() => {
      getOrders({ silent: true });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [getOrders]);

  const changeFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStatus('');
    setOrderType('');
    setOrderSource('');
    setSort('newest');
    setPage(1);
  };

  return (
    <section className="flex flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-base-content/70">Administrá los pedidos de tus clientes.</p>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={getOrders} disabled={loading}>
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="form-control w-full">
          <span className="label-text mb-1">Estado</span>
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => changeFilter(setStatus, e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ORDER_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1">Tipo de pedido</span>
          <select
            className="select select-bordered w-full"
            value={orderType}
            onChange={(e) => changeFilter(setOrderType, e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Retiro</option>
            <option value="table">Mesa</option>
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1">Origen</span>
          <select
            className="select select-bordered w-full"
            value={orderSource}
            onChange={(e) => changeFilter(setOrderSource, e.target.value)}
          >
            <option value="">Todos los orígenes</option>
            <option value="customer">Cliente</option>
            <option value="employee">Empleado</option>
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1">Ordenar por fecha</span>
          <select
            className="select select-bordered w-full"
            value={sort}
            onChange={(e) => changeFilter(setSort, e.target.value)}
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-base-content/70">
          {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
        </p>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={clearFilters}
          disabled={!status && !orderType && !orderSource && sort === 'newest'}
        >
          Limpiar filtros
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={getOrders}>
            Reintentar
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Pago</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center">
                  <span className="loading loading-spinner loading-md" />
                  <p className="mt-2">Cargando pedidos...</p>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  No se encontraron pedidos.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="font-mono text-xs">{order.id.slice(0, 8)}</span>
                    <div className="text-xs text-base-content/60">
                      {ORDER_SOURCES[order.order_source] ?? order.order_source ?? '—'}
                    </div>
                  </td>

                  <td>
                    <div className="font-medium">{order.customer_username || 'Cliente'}</div>
                    <div className="text-xs text-base-content/60">
                      {order.customer_phone || order.customer_email || ''}
                    </div>
                  </td>

                  <td className="whitespace-nowrap">
                    <div>{formatDate(order.created_at)}</div>

                    {hasOrderBeenUpdated(order) && (
                      <div className="mt-1 text-xs text-base-content/60">Mod.: {formatDate(order.updated_at)}</div>
                    )}
                  </td>

                  <td>
                    {ORDER_TYPES[order.order_type] ?? order.order_type ?? '—'}
                    {order.order_type === 'table' && order.table_number && (
                      <div className="text-xs text-base-content/60">Mesa {order.table_number}</div>
                    )}
                  </td>

                  <td>
                    <span className={`badge ${STATUS_STYLES[order.status] ?? 'badge-ghost'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>

                  <td>
                    <div>{PAYMENT_METHODS[order.payment_method] ?? order.payment_method}</div>
                    <div className="text-xs text-base-content/60">
                      {PAYMENT_STATUSES[order.payment_status] ?? order.payment_status}
                    </div>
                  </td>

                  <td className="whitespace-nowrap font-semibold">{formatPrice(order.total)}</td>

                  <td>
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedOrder(order)}>
                        Ver detalle
                      </button>
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setOrderToEdit(order)}>
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-base-content/70">
          Página {page} de {totalPages}
        </span>

        <div className="join">
          <button
            type="button"
            className="btn join-item"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </button>

          <button
            type="button"
            className="btn join-item"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
      {selectedOrder && (
        <AdminOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={getOrders} />
      )}
      {orderToEdit && (
        <AdminEditOrderModal order={orderToEdit} onClose={() => setOrderToEdit(null)} onUpdated={getOrders} />
      )}
    </section>
  );
};

export default AdminOrders;
