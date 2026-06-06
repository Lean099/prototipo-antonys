// store/useModalStore.js

import { create } from 'zustand';

export const useModalStore = create((set) => ({
  activeModal: null,

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),
}));
