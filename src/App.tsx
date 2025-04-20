import { Route, Routes } from "react-router";
import { useThemeHandler } from "./Hooks/useThemeHandler";
import Home from "./Pages/Home/Home";
import EventPage from "./Pages/Events/EventPage";
import upcoming from "./Assets/Data/upcoming.json";
import workshops from "./Assets/Data/workshops.json";
import social from "./Assets/Data/social.json";
import professional from "./Assets/Data/professional.json";

const App = () => {
  useThemeHandler();

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/events">
        <Route path="upcoming" element={<EventPage events={upcoming} />} />
        <Route path="workshops" element={<EventPage events={workshops} />} />
        <Route path="social" element={<EventPage events={social} />} />
        <Route path="professional" element={<EventPage events={professional} />} />
      </Route>
    </Routes>
  );
};

export default App;
