import { useEffect } from "react";
import { Route, Routes } from "react-router";
import Home from "./Pages/Home/Home";
import { useTheme } from "./Store/useTheme";

const App = () => {
  const { isDark, setIsDark } = useTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    // Update on changes
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setIsDark]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  );
};

export default App;
