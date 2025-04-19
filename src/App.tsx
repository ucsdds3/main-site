import { Route, Routes } from "react-router";
import { useThemeHandler } from "./Hooks/useThemeHandler";
import Home from "./Pages/Home/Home";

const App = () => {
  useThemeHandler();

  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  );
};

export default App;
