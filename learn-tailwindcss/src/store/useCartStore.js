import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const existing = get().cart.find((item) => item.id === product.id && item.sizeId === product.sizeId);

        if (existing) {
          set({
            cart: get().cart.map((item) =>
              item.id === product.id && item.sizeId === product.sizeId
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item,
            ),
          });
        } else {
          set({
            cart: [
              ...get().cart,
              {
                ...product,
                quantity: 1,
              },
            ],
          });
        }
      },

      removeFromCart: (id, sizeId = null) => {
        set({
          cart: get().cart.filter((item) =>
            sizeId !== null ? !(item.id === id && item.sizeId === sizeId) : item.id !== id,
          ),
        });
      },

      updateQuantity: (id, amount, sizeId = null) => {
        set({
          cart: get()
            .cart.map((item) =>
              sizeId !== null
                ? item.id === id && item.sizeId === sizeId
                  ? {
                      ...item,
                      quantity: item.quantity + amount,
                    }
                  : item
                : item.id === id
                  ? {
                      ...item,
                      quantity: item.quantity + amount,
                    }
                  : item,
            )
            .filter((item) => item.quantity > 0),
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotal: () => {
        return get().cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    },
  ),
);
