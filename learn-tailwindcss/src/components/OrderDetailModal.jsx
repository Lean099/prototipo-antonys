import { useState } from 'react';
import axios from 'axios';
import { useModalStore } from '../store/useModalStore';
import { useAuthStore } from '../store/authStore';

const OrderDetailModal = () => {
  const activeModal = useModalStore((state) => state.activeModal);
  const modalData = useModalStore((state) => state.modalData);
  const closeModal = useModalStore((state) => state.closeModal);

  const user = useAuthStore((state) => state.user);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState({});
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  if (activeModal !== 'orderDetail') return null;

  const order = modalData?.order;

  if (!order) return null;

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
        return 'Retiro en el local';

      case 'table':
        return 'Comer en el local';

      default:
        return type;
    }
  };

  const getPaymentText = (method) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';

      case 'transfer':
        return 'Transferencia';

      case 'mercado_pago':
        return 'Mercado Pago';

      default:
        return method;
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

  const parseItemNotes = (item) => {
    const result = {};

    if (!item.notes) {
      return result;
    }

    const parts = item.notes.split(' | ');

    parts.forEach((part) => {
      if (!part.startsWith('Unidad ')) return;

      try {
        const [unitText, observation] = part.split(': ', 2);

        const unitNumber = Number(unitText.replace('Unidad ', ''));

        if (!Number.isNaN(unitNumber)) {
          result[unitNumber] = observation ?? '';
        }
      } catch {
        // Ignorar observaciones con formato inválido
      }
    });

    return result;
  };

  const startEditingNotes = () => {
    const initialNotes = {};

    order.items?.forEach((item) => {
      const itemNotes = parseItemNotes(item);

      initialNotes[item.id] = {};

      for (let unit = 1; unit <= item.quantity; unit++) {
        initialNotes[item.id][unit] = itemNotes[unit] ?? '';
      }
    });

    setNotes(initialNotes);
    setNotesError(null);
    setEditingNotes(true);
  };

  const cancelEditingNotes = () => {
    setEditingNotes(false);
    setNotes({});
    setNotesError(null);
  };

  const handleNoteChange = (itemId, unitNumber, value) => {
    setNotes((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [unitNumber]: value,
      },
    }));
  };

  const saveNotes = async () => {
    try {
      setSavingNotes(true);
      setNotesError(null);

      for (const item of order.items ?? []) {
        for (let unit = 1; unit <= item.quantity; unit++) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/orders/updateOrderItemNotes/${order.id}/${item.id}/${unit}`,
            {
              notes: notes[item.id]?.[unit] ?? '',
            },
            {
              params: {
                user_id: user.id,
              },
            },
          );
        }
      }

      // Actualizar las observaciones del pedido localmente
      const updatedItems = order.items.map((item) => {
        const itemNotes = [];

        for (let unit = 1; unit <= item.quantity; unit++) {
          const observation = notes[item.id]?.[unit]?.trim();

          if (observation) {
            itemNotes.push(`Unidad ${unit}: ${observation}`);
          }
        }

        return {
          ...item,
          notes: itemNotes.length > 0 ? itemNotes.join(' | ') : null,
        };
      });

      modalData.order.items = updatedItems;

      setEditingNotes(false);
      setNotes({});
    } catch (error) {
      console.error('Error al actualizar las observaciones:', error);

      setNotesError(error.response?.data?.detail || 'No se pudieron guardar las observaciones.');
    } finally {
      setSavingNotes(false);
    }
  };

  const cancelOrder = async () => {
    try {
      setCancelling(true);
      setCancelError(null);

      await axios.put(`${import.meta.env.VITE_API_URL}/orders/cancelOrder/${order.id}`, null, {
        params: {
          user_id: user.id,
        },
      });

      await modalData?.onUpdated?.();

      setConfirmingCancel(false);
      closeModal();
    } catch (error) {
      console.error('Error al cancelar el pedido:', error);

      setCancelError(error.response?.data?.detail || 'No se pudo cancelar el pedido.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl">
        {/* CERRAR */}
        <button type="button" onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>

        {/* CABECERA */}
        <div className="pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-bold text-xl">Detalle del pedido</h3>

              <p className="text-sm text-base-content/60">Pedido #{order.id.slice(0, 8)}</p>
            </div>

            <span className={`badge ${getStatusBadge(order.status)}`}>{getStatusText(order.status)}</span>
          </div>

          <p className="text-sm text-base-content/60 mt-2">{formatDate(order.created_at)}</p>
        </div>

        <div className="divider" />

        {/* PRODUCTOS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">Productos</h4>

            {order.status === 'pending' && !editingNotes && (
              <button type="button" className="btn btn-sm btn-outline" onClick={startEditingNotes}>
                Modificar observaciones
              </button>
            )}
          </div>

          {/* ERROR */}
          {notesError && (
            <div className="alert alert-error mb-4">
              <span>{notesError}</span>
            </div>
          )}

          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="rounded-lg border border-base-300 p-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.product_name}</p>

                    {item.product_size_name && (
                      <p className="text-sm text-base-content/60">Tamaño: {item.product_size_name}</p>
                    )}

                    <p className="text-sm text-base-content/60">Cantidad: {item.quantity}</p>
                  </div>

                  <p className="font-semibold whitespace-nowrap">${Number(item.subtotal).toLocaleString('es-AR')}</p>
                </div>

                {/* MODO EDICIÓN */}
                {editingNotes && (
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: item.quantity }, (_, index) => {
                      const unitNumber = index + 1;

                      return (
                        <div key={unitNumber}>
                          <label className="label">
                            <span className="label-text font-medium">Unidad {unitNumber}</span>
                          </label>

                          <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Sin observaciones"
                            value={notes[item.id]?.[unitNumber] ?? ''}
                            onChange={(e) => handleNoteChange(item.id, unitNumber, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MODO NORMAL */}
                {!editingNotes && item.notes && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <p className="text-sm font-medium">Observaciones</p>

                    <p className="text-sm text-base-content/70 mt-1">{item.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BOTONES DE EDICIÓN */}
        {editingNotes && (
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" className="btn btn-ghost" onClick={cancelEditingNotes} disabled={savingNotes}>
              Cancelar
            </button>

            <button type="button" className="btn btn-primary" onClick={saveNotes} disabled={savingNotes}>
              {savingNotes ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        )}

        <div className="divider" />

        {/* TIPO Y PAGO */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-base-content/60">Tipo de pedido</p>

            <p className="font-medium">{getOrderTypeText(order.order_type)}</p>
          </div>

          <div>
            <p className="text-sm text-base-content/60">Medio de pago</p>

            <p className="font-medium">{getPaymentText(order.payment_method)}</p>
          </div>
        </section>

        {/* DIRECCIÓN */}
        {order.order_type === 'delivery' && (
          <>
            <div className="divider" />

            <section>
              <h4 className="font-semibold text-lg mb-2">Dirección de entrega</h4>

              <p>
                {order.delivery_street} {order.delivery_number}
              </p>

              {order.delivery_details && <p className="text-sm text-base-content/60">{order.delivery_details}</p>}

              {order.delivery_neighborhood && (
                <p className="text-sm text-base-content/60">Barrio: {order.delivery_neighborhood}</p>
              )}

              {order.delivery_latitude && order.delivery_longitude && (
                <a
                  href={`https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm inline-block mt-2"
                >
                  Ver ubicación en Google Maps
                </a>
              )}
            </section>
          </>
        )}

        <div className="divider" />

        {/* TOTALES */}
        <section className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>

            <span>${Number(order.subtotal).toLocaleString('es-AR')}</span>
          </div>

          {Number(order.delivery_fee) > 0 && (
            <div className="flex justify-between text-sm">
              <span>Envío</span>

              <span>${Number(order.delivery_fee).toLocaleString('es-AR')}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>

            <span>${Number(order.total).toLocaleString('es-AR')}</span>
          </div>
        </section>
        {/* ACCIONES DEL PEDIDO */}
        {order.status === 'pending' && !editingNotes && !confirmingCancel && (
          <>
            <div className="divider" />

            <div className="flex justify-end">
              <button
                type="button"
                className="btn btn-error btn-outline"
                onClick={() => {
                  setCancelError(null);
                  setConfirmingCancel(true);
                }}
              >
                Cancelar pedido
              </button>
            </div>
          </>
        )}
        {confirmingCancel && (
          <>
            <div className="divider" />

            <div className="rounded-lg border border-error/30 bg-error/5 p-4">
              <h4 className="font-semibold text-lg">¿Cancelar pedido?</h4>

              <p className="text-sm text-base-content/70 mt-1">Esta acción no se puede deshacer.</p>

              {cancelError && (
                <div className="alert alert-error mt-3">
                  <span>{cancelError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setConfirmingCancel(false);
                    setCancelError(null);
                  }}
                  disabled={cancelling}
                >
                  Volver
                </button>

                <button type="button" className="btn btn-error" onClick={cancelOrder} disabled={cancelling}>
                  {cancelling ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Cancelando...
                    </>
                  ) : (
                    'Sí, cancelar'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="modal-backdrop" onClick={closeModal} />
    </dialog>
  );
};

export default OrderDetailModal;
