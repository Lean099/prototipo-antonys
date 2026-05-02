import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const existing = get().cart.find(item => item.id === product.id)

        if (existing) {
          set({
            cart: get().cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({
            cart: [...get().cart, { ...product, quantity: 1 }]
          })
        }
      },

      removeFromCart: (id) => {
        set({
          cart: get().cart.filter(item => item.id !== id)
        })
      },

      updateQuantity: (id, amount) => {
        set({
          cart: get().cart
            .map(item =>
              item.id === id
                ? { ...item, quantity: item.quantity + amount }
                : item
            )
            .filter(item => item.quantity > 0)
        })
      },

      clearCart: () => set({ cart: [] }),

      getTotal: () => {
        return get().cart.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        )
      }
    }),
    {
      name: "cart-storage"
    }
  )
)