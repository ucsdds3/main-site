import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setIsDark: (val: boolean) => void;
}

export const useTheme = create<ThemeState>((set) => {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultDark = storedTheme ? storedTheme === "dark" : prefersDark;

  return {
    isDark: defaultDark,
    setIsDark: (val) => set({ isDark: val }),
    toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  };
});
