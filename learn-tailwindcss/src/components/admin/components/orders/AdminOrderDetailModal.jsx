import { useEffect, useState } from 'react';
import axios from 'axios';
import { X, ExternalLink, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'ready', label: 'Listo' },
  { value: 'on_the_way', label: 'En camino' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'failed', label: 'Fallido' },
];

const STATUS_LABELS = Object.fromEntries(STATUSES.map(({ value, label }) => [value, label]));

const PAYMENT_METHODS = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  mercado_pago: 'Mercado Pago',
};

const ORDER_TYPES = {
  delivery: 'Delivery',
  pickup: 'Retiro',
  table: 'Mesa',
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

const AdminOrderDetailModal = ({ order, onClose, onUpdated }) => {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);

  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCurrentOrder(order);
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setError('');
    setMessage('');
  }, [order]);

  const saveStatus = async () => {
    if (status === currentOrder.status) return;

    setSavingStatus(true);
    setError('');
    setMessage('');

    try {
      await axios.put(`${API_URL}/orders/updateOrderStatus/${currentOrder.id}`, { status });

      setCurrentOrder((previous) => ({ ...previous, status }));
      setMessage('Estado del pedido actualizado.');
      await onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.detail ?? 'No se pudo actualizar el estado del pedido.');
    } finally {
      setSavingStatus(false);
    }
  };

  const savePaymentStatus = async () => {
    if (paymentStatus === currentOrder.payment_status) return;

    setSavingPayment(true);
    setError('');
    setMessage('');

    try {
      await axios.put(`${API_URL}/orders/updateOrderPaymentStatus/${currentOrder.id}`, {
        payment_status: paymentStatus,
      });

      setCurrentOrder((previous) => ({
        ...previous,
        payment_status: paymentStatus,
      }));

      setMessage('Estado del pago actualizado.');
      await onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.detail ?? 'No se pudo actualizar el estado del pago.');
    } finally {
      setSavingPayment(false);
    }
  };

  const address = [currentOrder.delivery_street, currentOrder.delivery_number].filter(Boolean).join(' ');

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-h-[90vh] max-w-3xl overflow-y-auto p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Detalle del pedido</h2>
            <p className="mt-1 break-all font-mono text-xs text-base-content/60">{currentOrder.id}</p>
          </div>

          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Cerrar detalle"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div role="status" className="alert alert-success mb-4">
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="rounded-box border border-base-300 p-4">
            <h3 className="mb-3 font-semibold">Cliente</h3>
            <p className="font-medium">{currentOrder.customer_username || 'Cliente'}</p>
            {currentOrder.customer_email && (
              <p className="break-words text-sm text-base-content/70">{currentOrder.customer_email}</p>
            )}
            {currentOrder.customer_phone && (
              <p className="text-sm text-base-content/70">{currentOrder.customer_phone}</p>
            )}
            <div className="mt-3 space-y-1 text-sm text-base-content/70">
              <p>Creado: {formatDate(currentOrder.created_at)}</p>

              {hasOrderBeenUpdated(currentOrder) && <p>Última modificación: {formatDate(currentOrder.updated_at)}</p>}
            </div>
            <p className="text-sm text-base-content/70">
              Origen: {currentOrder.order_source === 'employee' ? 'Empleado' : 'Cliente'}
            </p>
          </section>

          <section className="rounded-box border border-base-300 p-4">
            <h3 className="mb-3 font-semibold">Entrega y pago</h3>
            <p>
              <span className="text-base-content/60">Tipo:</span>{' '}
              {ORDER_TYPES[currentOrder.order_type] ?? currentOrder.order_type}
            </p>

            {currentOrder.order_type === 'table' && <p>Mesa: {currentOrder.table_number || '—'}</p>}

            {currentOrder.order_type === 'delivery' && (
              <div className="mt-2 text-sm">
                <p>Dirección: {address || '—'}</p>
                {currentOrder.delivery_neighborhood && <p>Barrio: {currentOrder.delivery_neighborhood}</p>}
                {currentOrder.delivery_details && <p>Referencias: {currentOrder.delivery_details}</p>}
                {currentOrder.delivery_location_url && (
                  <a
                    className="link link-primary mt-1 inline-flex items-center gap-1"
                    href={currentOrder.delivery_location_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver ubicación <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}

            <div className="mt-3 border-t border-base-300 pt-3">
              <p>Método: {PAYMENT_METHODS[currentOrder.payment_method] ?? currentOrder.payment_method}</p>
              <p>
                Pago:{' '}
                {PAYMENT_STATUSES.find((item) => item.value === currentOrder.payment_status)?.label ??
                  currentOrder.payment_status}
              </p>
            </div>
          </section>
        </div>

        <section className="mt-5">
          <h3 className="mb-3 font-semibold">Productos del pedido</h3>

          <div className="overflow-x-auto rounded-box border border-base-300">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-right">Precio unit.</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {(currentOrder.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p className="font-medium">{item.product_name}</p>
                      {item.product_size_name && (
                        <p className="text-xs text-base-content/60">Tamaño: {item.product_size_name}</p>
                      )}
                      {item.notes && (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-base-content/70">Nota: {item.notes}</p>
                      )}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right whitespace-nowrap">{formatPrice(item.unit_price)}</td>
                    <td className="text-right whitespace-nowrap">{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentOrder.notes && (
            <div className="mt-3 rounded-box bg-base-200 p-3">
              <p className="text-sm font-semibold">Observaciones del pedido</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{currentOrder.notes}</p>
            </div>
          )}
        </section>

        <section className="mt-5 ml-auto max-w-sm space-y-2">
          <div className="flex justify-between gap-4 text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(currentOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span>Envío</span>
            <span>{formatPrice(currentOrder.delivery_fee)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-base-300 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(currentOrder.total)}</span>
          </div>
        </section>

        <div className="divider" />

        <section className="space-y-4">
          <h3 className="font-semibold">Acciones administrativas</h3>

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto]">
            <label className="form-control">
              <span className="label-text mb-1">Estado del pedido</span>
              <select
                className="select select-bordered w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={savingStatus}
              >
                {STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={saveStatus}
              disabled={savingStatus || status === currentOrder.status || savingPayment}
            >
              {savingStatus ? <span className="loading loading-spinner loading-sm" /> : <Save size={16} />}
              Guardar estado
            </button>
          </div>

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto]">
            <label className="form-control">
              <span className="label-text mb-1">Estado del pago</span>
              <select
                className="select select-bordered w-full"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                disabled={savingPayment}
              >
                {PAYMENT_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={savePaymentStatus}
              disabled={savingPayment || paymentStatus === currentOrder.payment_status || savingStatus}
            >
              {savingPayment ? <span className="loading loading-spinner loading-sm" /> : <Save size={16} />}
              Guardar pago
            </button>
          </div>
        </section>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Cerrar detalle">
        Cerrar
      </button>
    </div>
  );
};

export default AdminOrderDetailModal;
