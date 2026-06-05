import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCheckoutStore = create(
  persist(
    (set) => ({
      deliveryOption: null,
      addresses: [],
      selectedAddressId: null,
      paymentMethodsOption: null,

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

      clearCheckout: () =>
        set({
          deliveryOption: null,
          addresses: [],
          selectedAddressId: null,
          paymentMethodsOption: null,
        }),
    }),
    {
      name: 'checkout-storage',
    },
  ),
);
