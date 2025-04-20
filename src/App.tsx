import { Route, Routes } from "react-router";
import { useThemeHandler } from "./Hooks/useThemeHandler";
import Home from "./Pages/Home/Home";
import Upcoming from "./Pages/Events/Upcoming";

const App = () => {
  useThemeHandler();

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/events">
        <Route path="upcoming" element={<Upcoming />} />
      </Route>
    </Routes>
  );
};

export default App;
