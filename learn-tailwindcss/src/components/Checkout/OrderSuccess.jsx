import formatSizeName from '../../utils/formatSizeName';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = ({ order }) => {
  const navigate = useNavigate();
  const handleWhatsApp = () => {
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER;

    const itemsText = order.items
      .map((item) => {
        const size = item.product_size_name ? ` - ${formatSizeName(item.product_size_name)}` : '';

        const notes = item.notes ? `\n  Observaciones: ${item.notes}` : '';

        return `- ${item.product_name}${size} x${item.quantity} - $${Number(item.subtotal).toLocaleString()}${notes}`;
      })
      .join('\n\n');

    const orderType = {
      delivery: 'Envío a domicilio',
      pickup: 'Retiro por el local',
      table: 'Comer en el local',
    };

    const paymentMethod = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      mercado_pago: 'Mercado Pago',
    };

    let message = `ANTONY'S - NUEVO PEDIDO

PEDIDO: #${order.id}
CLIENTE: ${order.customer_username}

PRODUCTOS:
${itemsText}

SUBTOTAL: $${Number(order.subtotal).toLocaleString()}
ENVIO: ${Number(order.delivery_fee) === 0 ? 'Gratis' : `$${Number(order.delivery_fee).toLocaleString()}`}
TOTAL: $${Number(order.total).toLocaleString()}

TIPO: ${orderType[order.order_type]}
PAGO: ${paymentMethod[order.payment_method]}`;

    if (order.order_type === 'delivery') {
      message += `

DIRECCION:
${order.delivery_street} ${order.delivery_number}`;

      if (order.delivery_neighborhood) {
        message += `\n${order.delivery_neighborhood}`;
      }

      if (order.delivery_details) {
        message += `\n${order.delivery_details}`;
      }

      if (order.delivery_latitude && order.delivery_longitude) {
        const mapsUrl =
          `https://www.google.com/maps/search/?api=1&query=` + `${order.delivery_latitude},${order.delivery_longitude}`;

        message += `

UBICACION EN GOOGLE MAPS:
${mapsUrl}`;
      }
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 mb-20">
      {/* ENCABEZADO */}

      <div className="text-center mb-8">
        <div className="text-5xl mb-4">✓</div>

        <h1 className="text-3xl font-bold">¡Pedido realizado!</h1>

        <p className="opacity-70 mt-2">Tu pedido fue registrado correctamente.</p>

        <p className="text-sm opacity-60 mt-1">Pedido #{order.id}</p>
      </div>

      {/* PRODUCTOS */}

      <div className="bg-base-200 rounded-xl p-5 shadow-inner mb-6">
        <h2 className="font-bold text-lg mb-4">Tu pedido</h2>

        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between gap-4">
              <div>
                <p className="font-medium">
                  {item.product_name}

                  {item.product_size_name && (
                    <span className="opacity-70">
                      {' - '}
                      {formatSizeName(item.product_size_name)}
                    </span>
                  )}
                </p>

                <p className="text-sm opacity-60">Cantidad: {item.quantity}</p>

                {item.notes && <p className="text-sm opacity-70 mt-1">📝 {item.notes}</p>}
              </div>

              <span className="font-bold whitespace-nowrap">${Number(item.subtotal).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* TOTALES */}

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>Envío</span>
            <span>
              {Number(order.delivery_fee) === 0 ? 'Gratis' : `$${Number(order.delivery_fee).toLocaleString()}`}
            </span>
          </div>

          <div className="divider my-2" />

          <div className="flex justify-between text-xl font-extrabold">
            <span>Total</span>
            <span>${Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DEL PEDIDO */}

      <div className="bg-base-200 rounded-xl p-5 shadow-inner">
        <h2 className="font-bold text-lg mb-4">Información del pedido</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="opacity-60">Tipo de pedido</span>

            <span className="font-medium">
              {order.order_type === 'delivery'
                ? 'Envío a domicilio'
                : order.order_type === 'pickup'
                  ? 'Retiro por local'
                  : 'Comer en el local'}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="opacity-60">Método de pago</span>

            <span className="font-medium">
              {order.payment_method === 'cash'
                ? 'Efectivo'
                : order.payment_method === 'transfer'
                  ? 'Transferencia'
                  : 'Mercado Pago'}
            </span>
          </div>

          {order.order_type === 'delivery' && (
            <div className="pt-2">
              <p className="opacity-60 mb-1">Dirección de entrega</p>

              <p className="font-medium">
                {order.delivery_street} {order.delivery_number}
              </p>

              {order.delivery_neighborhood && <p className="opacity-70">{order.delivery_neighborhood}</p>}

              {order.delivery_details && <p className="opacity-70">{order.delivery_details}</p>}

              {order.delivery_latitude && order.delivery_longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.delivery_latitude},${order.delivery_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm mt-2 inline-block"
                >
                  Ver ubicación en Google Maps
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button type="button" className="btn btn-success w-full" onClick={handleWhatsApp}>
          Enviar pedido por WhatsApp
        </button>

        <button type="button" className="btn btn-primary w-full" onClick={() => navigate('/pedidos')}>
          Ver mis pedidos
        </button>

        <button type="button" className="btn btn-outline w-full" onClick={() => navigate('/#menu')}>
          Volver al menú
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
