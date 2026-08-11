import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCheckoutStore = create(
  persist(
    (set) => ({
      deliveryOption: null,
      addresses: [],
      selectedAddressId: null,
      paymentMethodsOption: null,
      orderNotes: [],

      // acciones
      setDeliveryOption: (option) => set({ deliveryOption: option }),

      setSelectedAddress: (id) => set({ selectedAddressId: id }),

      /*addAddress: (newAddr) =>
        set((state) => ({
          addresses: [...state.addresses, newAddr],
          selectedAddressId: newAddr.is_default ? newAddr.id : state.selectedAddressId,
        })),*/

      setAddresses: (addresses) =>
        set({
          addresses,
          //selectedAddressId: addresses.find((a) => a.is_default)?.id ?? null,
        }),

      removeAddress: (id) =>
        set((state) => {
          const updatedAddresses = state.addresses.filter((addr) => addr.id !== id);

          return {
            addresses: updatedAddresses,
            selectedAddressId: state.selectedAddressId === id ? null : state.selectedAddressId,
          };
        }),

      setPMSelected: (method) => set({ paymentMethodsOption: method }),

      addOrderNote: (note) =>
        set((state) => ({
          orderNotes: [...state.orderNotes, note],
        })),

      removeOrderNote: (index) =>
        set((state) => ({
          orderNotes: state.orderNotes.filter((_, i) => i !== index),
        })),

      clearOrderNotes: () =>
        set({
          orderNotes: [],
        }),

      clearCheckout: () =>
        set({
          deliveryOption: null,
          addresses: [],
          selectedAddressId: null,
          paymentMethodsOption: null,
          orderNotes: [],
        }),
    }),
    {
      name: 'checkout-storage',
    },
  ),
);
