import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMenuStore = create(
  persist(
    (set) => ({
      categories: [],
      products: [],
      selectedCategory: 'todos',

      setCategories: (categories) => set({ categories }),
      setProducts: (products) => set({ products }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
    }),
    {
      name: 'menu-storage',
      partialize: (state) => ({
        categories: state.categories,
        products: state.products,
      }),
    },
  ),
);
