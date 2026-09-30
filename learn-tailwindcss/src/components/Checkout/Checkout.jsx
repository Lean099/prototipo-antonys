import axios from 'axios';
import { useEffect, useState } from 'react';

import ShippingSelector from './ShippingSelector';
import OrderNotes from './OrderNotes';
import PaymentMethods from './PaymentMethods';
import OrderSuccess from './OrderSuccess';

import { useCartStore } from '../../store/useCartStore';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useModalStore } from '../../store/useModalStore';
import { useAuthStore } from '../../store/authStore';

import formatSizeName from '../../utils/formatSizeName';

const Checkout = () => {
  const { cart, getTotal } = useCartStore();
  const clearCart = useCartStore((state) => state.clearCart);

  const clearCheckout = useCheckoutStore((state) => state.clearCheckout);
  const deliveryOption = useCheckoutStore((state) => state.deliveryOption);
  const selectedAddressId = useCheckoutStore((state) => state.selectedAddressId);
  const paymentMethodsOption = useCheckoutStore((state) => state.paymentMethodsOption);
  const orderNotes = useCheckoutStore((state) => state.orderNotes);

  const user = useAuthStore((state) => state.user);
  const openModal = useModalStore((state) => state.openModal);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      openModal('login');
    }
  }, [user, openModal]);

  const handleCreateOrder = async () => {
    if (!user) return;

    if (!deliveryOption) {
      console.error('No se seleccionó cómo recibir el pedido');
      return;
    }

    if (!paymentMethodsOption) {
      console.error('No se seleccionó un método de pago');
      return;
    }

    if (deliveryOption === 'delivery' && !selectedAddressId) {
      console.error('No se seleccionó una dirección');
      return;
    }

    const paymentMethodMap = {
      efectivo: 'cash',
      transferencia: 'transfer',
      mercado_pago: 'mercado_pago',
    };

    const items = cart.map((product) => {
      const productKey = `${product.id}-${product.sizeId ?? 'normal'}`;

      const productNotes = orderNotes
        .filter((item) => item.productKey === productKey)
        .map((item, index) => `Unidad ${index + 1}: ${item.note}`)
        .join(' | ');

      return {
        product_id: product.id,
        product_size_id: product.sizeId ?? null,
        quantity: product.quantity,
        notes: productNotes || null,
      };
    });

    const payload = {
      user_id: user.id,
      order_type: deliveryOption,
      address_id: deliveryOption === 'delivery' ? selectedAddressId : null,
      payment_method: paymentMethodMap[paymentMethodsOption],
      items,
      notes: null,
    };

    try {
      setIsCreatingOrder(true);

      const API_URL = import.meta.env.VITE_API_URL;

      const response = await axios.post(`${API_URL}/orders/createOrder`, payload);

      setCreatedOrder(response.data);

      clearCart();
      clearCheckout();
    } catch (error) {
      console.error('ERROR AL CREAR LA ORDEN:', error);

      if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.detail || 'Error al crear la orden');
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (createdOrder) {
    return <OrderSuccess order={createdOrder} />;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 mb-20">
      <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>

      <div className="bg-base-200 p-5 rounded-xl mb-6 shadow-inner">
        <h2 className="font-bold mb-4 text-lg">Tu pedido</h2>

        {cart.map((item) => (
          <div
            key={`${item.id}-${item.sizeId ?? 'normal'}`}
            className="flex justify-between items-center mb-4 last:mb-0"
          >
            <div className="flex items-center gap-4">
              <figure className="h-20 w-24 overflow-hidden flex-shrink-0">
                <img className="w-full h-full object-cover rounded-lg shadow-sm" src={item.image_url} alt={item.name} />
              </figure>

              <div className="flex flex-col">
                <span className="font-medium text-sm md:text-base">
                  {item.isHamburger ? `Hamb. ${item.name.replace(/^Hamburguesa\s+/i, '')}` : item.name}

                  {item.sizeName && (
                    <span className="opacity-70">
                      {' - '}
                      {formatSizeName(item.sizeName)}
                    </span>
                  )}
                </span>

                <span className="text-gray-500 text-xs font-bold">Cantidad: {item.quantity}</span>
              </div>
            </div>

            <span className="font-bold text-md">${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}

        <div className="divider my-4" />

        <div className="flex justify-between font-extrabold text-xl">
          <span>Total</span>
          <span>${getTotal().toLocaleString()}</span>
        </div>
      </div>

      {cart.length > 0 && (
        <>
          <OrderNotes cart={cart} />

          <ShippingSelector />

          {deliveryOption && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <hr className="my-10 border-base-300" />

              <PaymentMethods
                cart={cart}
                total={getTotal()}
                onConfirm={handleCreateOrder}
                isCreatingOrder={isCreatingOrder}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Checkout;
