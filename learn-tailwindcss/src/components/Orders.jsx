import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useModalStore } from '../store/useModalStore';

const Orders = () => {
  const user = useAuthStore((state) => state.user);
  const openModal = useModalStore((state) => state.openModal);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const ordersPerPage = 10;

  const getOrders = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/getMyOrders/${user.id}`, {
        params: {
          page: currentPage,
          limit: ordersPerPage,
          status: statusFilter === 'all' ? undefined : statusFilter,
          sort: sortOrder,
        },
      });

      const newTotalPages = response.data.total_pages;

      if (newTotalPages > 0 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
        return;
      }

      setOrders(response.data.items);
      setTotalPages(newTotalPages);
      setTotalOrders(response.data.total);
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      setError('No se pudieron cargar tus pedidos.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentPage, statusFilter, sortOrder]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';

      case 'confirmed':
        return 'badge-info';

      case 'completed':
        return 'badge-success';

      case 'cancelled':
        return 'badge-error';

      default:
        return 'badge-neutral';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';

      case 'confirmed':
        return 'Confirmado';

      case 'completed':
        return 'Completado';

      case 'cancelled':
        return 'Cancelado';

      default:
        return status;
    }
  };

  const getOrderTypeText = (type) => {
    switch (type) {
      case 'delivery':
        return 'Delivery';

      case 'pickup':
        return 'Retiro';

      case 'table':
        return 'Mesa';

      default:
        return type;
    }
  };

  const formatDate = (date) => {
    const formatted = new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return formatted.replace(', ', ' · ');
  };

  const getProductsPreview = (order) => {
    return order.items?.map((item) => `${item.product_name} x${item.quantity}`).join(', ');
  };

  const getPaginationPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      '...',
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      '...',
      totalPages,
    ];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Mis pedidos</h2>

        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Mis pedidos</h2>

        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* TÍTULO */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Mis pedidos</h2>

        <p className="text-base-content/60 mt-1">Consultá el estado y los detalles de tus pedidos.</p>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* Estado */}
        <select
          className="select select-bordered w-full md:w-auto"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmados</option>
          <option value="completed">Completados</option>
          <option value="cancelled">Cancelados</option>
        </select>

        {/* Orden */}
        <select
          className="select select-bordered w-full md:w-auto"
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
        </select>
      </div>

      {totalOrders > 0 && (
        <p className="text-sm text-base-content/60 mb-4">
          {totalOrders} {totalOrders === 1 ? 'pedido' : 'pedidos'}
        </p>
      )}

      {/* SIN PEDIDOS */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No hay pedidos para mostrar.</p>

          {totalOrders > 0 && <p className="text-base-content/60 mt-2">Probá cambiando el filtro seleccionado.</p>}
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              {/* CABECERA */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">Pedido #{order.id.slice(0, 8)}</h3>

                  <p className="text-sm text-base-content/60">{formatDate(order.created_at)}</p>
                </div>

                <span className={`badge ${getStatusBadge(order.status)}`}>{getStatusText(order.status)}</span>
              </div>

              {/* TIPO */}
              <div className="text-sm mt-2">
                <span className="font-medium">Tipo:</span> {getOrderTypeText(order.order_type)}
              </div>

              {/* PRODUCTOS */}
              <div className="text-sm">
                <span className="font-medium">Productos:</span> {getProductsPreview(order)}
              </div>

              {/* TOTAL */}
              <div className="mt-3">
                <span className="text-sm text-base-content/60">Total</span>

                <p className="text-xl font-bold">${Number(order.total).toLocaleString('es-AR')}</p>
              </div>

              {/* ACCIÓN */}
              <div className="card-actions justify-end mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    openModal('orderDetail', {
                      order,
                      mode: 'client',
                      onUpdated: getOrders,
                    })
                  }
                >
                  Ver pedido
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            <button
              type="button"
              className="join-item btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              «
            </button>

            {getPaginationPages().map((page, index) =>
              page === '...' ? (
                <button key={`ellipsis-${index}`} type="button" className="join-item btn btn-disabled">
                  ...
                </button>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              className="join-item btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
