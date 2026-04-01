import { create } from "zustand";

interface ThemeState {
  /** Fixed to dark; kept for call sites that branch on `isDark` for assets and colors. */
  isDark: boolean;
}

export const useTheme = create<ThemeState>(() => ({
  isDark: true,
}));
