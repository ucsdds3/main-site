import { useEffect } from "react";

export const useThemeHandler = () => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }, []);
};
