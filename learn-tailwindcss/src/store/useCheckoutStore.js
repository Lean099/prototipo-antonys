import { create } from 'zustand'

export const useCheckoutStore = create((set) => ({
  deliveryOption: null, // 'pickup' | 'delivery'
  addresses: [
    { id: 1, street: "Av. Siempre Viva 742", obs: "Casa con rejas blancas", city: "Springfield" }
  ],
  selectedAddressId: 1,

  // Acciones
  setDeliveryOption: (option) => set({ deliveryOption: option }),
  setSelectedAddress: (id) => set({ selectedAddressId: id }),
  addAddress: (newAddr) => set((state) => {
    const newId = Date.now();
    return {
      addresses: [...state.addresses, { ...newAddr, id: newId }],
      selectedAddressId: newId
    };
  }),

  // Metodos de pago

  paymentMethodsOption: null, // debito | transferencia | efectivo
  setPMSelected: (method) => set({paymentMethodsOption: method}),

}));