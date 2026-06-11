import { create } from 'zustand';

export const useModalStore = create((set) => ({
  activeModal: null,
  modalData: null,

  openModal: (modal, data = null) =>
    set({
      activeModal: modal,
      modalData: data,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalData: null,
    }),
}));
