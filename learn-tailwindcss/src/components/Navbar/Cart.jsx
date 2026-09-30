import { useCartStore } from '../../store/useCartStore';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import formatSizeName from '../../utils/formatSizeName';

const Cart2 = () => {
  const navigate = useNavigate();

  const { cart, updateQuantity, removeFromCart, clearCart, getTotal } = useCartStore();

  const total = getTotal();

  const [open, setOpen] = useState(false);

  // Cantidad total de unidades, no de productos distintos
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`dropdown dropdown-end mx-1 ${open ? 'dropdown-open' : ''}`}>
      {/* BOTÓN */}
      <button className="btn btn-ghost btn-circle" onClick={() => setOpen((prev) => !prev)}>
        <div className="indicator">
          <ShoppingCart className="h-5 w-5" />

          <span className="badge badge-sm indicator-item">{totalItems}</span>
        </div>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="card card-compact dropdown-content bg-base-100 mt-3 w-80 sm:w-96 shadow-xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-body">
            <span className="font-bold">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>

            {cart.length === 0 && <p className="text-sm opacity-70">Carrito vacío</p>}

            {/* PRODUCTOS */}
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={`${item.id}-${item.sizeId ?? 'normal'}`} className="flex items-center justify-between gap-3">
                  {/* NOMBRE + PRECIO */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium break-words">
                      {item.isHamburger ? `Hamb. ${item.name.replace(/^Hamburguesa\s+/i, '')}` : item.name}

                      {item.sizeName && (
                        <span className="opacity-70">
                          {' - '}
                          {formatSizeName(item.sizeName)}
                        </span>
                      )}
                    </p>

                    <p className="text-xs opacity-60">${item.price} c/u</p>
                  </div>

                  {/* CONTROLES */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="btn btn-xs btn-ghost" onClick={() => updateQuantity(item.id, -1, item.sizeId)}>
                      <Minus size={15} />
                    </button>

                    <span className="w-5 text-center text-sm">{item.quantity}</span>

                    <button className="btn btn-xs btn-ghost" onClick={() => updateQuantity(item.id, 1, item.sizeId)}>
                      <Plus size={15} />
                    </button>

                    <button className="btn btn-xs btn-error" onClick={() => removeFromCart(item.id, item.sizeId)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="border-t border-base-300 pt-3 mt-2">
              <span className="font-bold">Total: ${total}</span>
            </div>

            {/* BOTONES */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={() => navigate('/checkout')}
                disabled={cart.length === 0}
              >
                Ver resumen
              </button>

              <button className="btn btn-neutral btn-sm w-full" onClick={clearCart} disabled={cart.length === 0}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart2;
