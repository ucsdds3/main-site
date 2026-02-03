import { create } from "zustand";

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  baseColor: string;
  oppositeColor: string;
  isDark: boolean;
  toggleTheme: () => void;
  setIsDark: (val: boolean) => void;
}

const getThemeColors = (isDark: boolean) => ({
  primaryColor: isDark ? "#F58134" : "#19B5CA",
  secondaryColor: isDark ? "#19B5CA" : "#F58134",
  baseColor: isDark ? "#FFFFFF" : "#000000",
  oppositeColor: isDark ? "#FFFFFF" : "#000000",
});

export const useTheme = create<ThemeState>((set, get) => {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultDark = storedTheme ? storedTheme === "dark" : prefersDark;
  const initialColors = getThemeColors(defaultDark);

  return {
    ...initialColors,
    isDark: defaultDark,
    setIsDark: val => {
      const colors = getThemeColors(val);
      set({ isDark: val, ...colors });
      localStorage.setItem("theme", val ? "dark" : "light");
    },
    toggleTheme: () => {
      const newIsDark = !get().isDark;
      const colors = getThemeColors(newIsDark);
      set({ isDark: newIsDark, ...colors });
      localStorage.setItem("theme", newIsDark ? "dark" : "light");
    },
  };
});
