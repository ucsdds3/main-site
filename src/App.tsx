import { Route, Routes } from "react-router";
import { useThemeHandler } from "./Hooks/useThemeHandler";
import Home from "./Pages/Home/Home";
import EventPage from "./Pages/Events/EventPage";
import events from "./Assets/Data/events.json";
import Board from "./Pages/Board/Board";

const App = () => {
  const { upcoming, workshops, social, professional } = events;
  useThemeHandler();

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/board" element={<Board />} />
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
