import { useCartStore } from "../../store/useCartStore";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Cart2 = () => {
  const navigate = useNavigate();

  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal
  } = useCartStore();

  const total = getTotal();

  const [open, setOpen] = useState(false);

  return (
    <div className={`dropdown dropdown-end mr-3 ${open ? "dropdown-open" : ""}`}>
      
      {/* BOTÓN */}
      <button
        className="btn btn-ghost btn-circle"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="indicator">
          <ShoppingCart className="h-5 w-5" />
          <span className="badge badge-sm indicator-item">
            {cart.length}
          </span>
        </div>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="card card-compact dropdown-content bg-base-100 mt-3 w-64 shadow z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-body">

            <span className="font-bold">
              {cart.length} productos
            </span>

            {cart.length === 0 && (
              <p className="text-sm opacity-70">Carrito vacío</p>
            )}

            {cart.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <span>{item.title}</span>

                <div className="flex gap-1 items-center">
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <span className="font-bold mt-2">
              Total: ${total}
            </span>
            

            <div className="flex flex-col gap-2 mt-2">
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={() => navigate("/checkout")}
                disabled={cart.length === 0}
              >
                Ver resumen
              </button>

              <button
                className="btn btn-neutral btn-sm w-full"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
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