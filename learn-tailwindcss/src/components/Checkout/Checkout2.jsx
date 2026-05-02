import ShippingSelector from './ShippingSelector';
import PaymentMethods from './PaymentMethods2';
import { useCartStore } from "../../store/useCartStore";
import { useCheckoutStore } from "../../store/useCheckoutStore";

const Checkout = () => {
  // Consumimos el store del Carrito
  const { cart, getTotal } = useCartStore();
  
  // Consumimos el store de Envío
  const deliveryOption = useCheckoutStore(state => state.deliveryOption);

  return (
    <div className="max-w-3xl mx-auto p-4 mb-20">
      <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>

      {/* RESUMEN DE PRODUCTOS CON IMÁGENES */}
      <div className="bg-base-200 p-5 rounded-xl mb-8 shadow-inner">
        <h2 className="font-bold mb-4 text-lg">Tu pedido</h2>
        
        {cart.map(item => (
          <div key={item.id} className="flex justify-between items-center mb-4 last:mb-0">
            <div className='flex items-center gap-4'>
              {/* Restauramos la imagen aquí */}
              <figure className="h-20 w-24 overflow-hidden flex-shrink-0">
                <img
                  className="w-full h-full object-cover rounded-lg shadow-sm"
                  src={item.image}
                  alt={item.title} 
                />
              </figure>
              <div className="flex flex-col">
                <span className="font-medium text-sm md:text-base">{item.title}</span>
                <span className="text-gray-500 text-xs font-bold">Cantidad: {item.quantity}</span>
              </div>
            </div>
            <span className="font-bold text-md">${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}

        <div className="divider my-4"></div>

        <div className="flex justify-between font-extrabold text-xl">
          <span>Total</span>
          <span className="">${getTotal().toLocaleString()}</span>
        </div>
      </div>

      {/* COMPONENTE DE SELECCIÓN DE ENVÍO */}
      <ShippingSelector />

      {/* MÉTODOS DE PAGO */}
      {/* Se desbloquean solo cuando el usuario define la logística */}
      {deliveryOption && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <hr className="my-10 border-base-300" />
          <PaymentMethods cart={cart} total={getTotal()} />
        </div>
      )}
    </div>
  );
};

export default Checkout;