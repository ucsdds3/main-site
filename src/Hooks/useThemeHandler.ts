import { useEffect } from "react";
import { useTheme } from "../Store/useTheme";

export const useThemeHandler = () => {
  const { isDark, setIsDark } = useTheme();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(storedTheme ? storedTheme == "dark" : mediaQuery.matches);

    // Update on system theme change
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      localStorage.setItem("theme", e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setIsDark]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);
};
