// store/useBackendStatusStore.js

import { create } from "zustand"

export const useBackendStatusStore = create((set) => ({
  status: "checking",
  visible: true,

  setStatus: (newStatus) =>
    set((state) => {
      // solo reabrir alerta si hubo cambio
      if (state.status !== newStatus) {
        return {
          status: newStatus,
          visible: true,
        }
      }

      return {
        status: newStatus,
      }
    }),

  closeAlert: () =>
    set({
      visible: false,
    }),
}))