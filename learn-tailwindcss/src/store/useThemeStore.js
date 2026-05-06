import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "cupcake",

      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },

      toggleTheme: () => {
        const newTheme = get().theme === "cupcake" ? "dark" : "cupcake";
        document.documentElement.setAttribute("data-theme", newTheme);
        set({ theme: newTheme });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);