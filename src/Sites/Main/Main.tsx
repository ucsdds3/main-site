import { Route, Routes } from "react-router";

import Home from "./Pages/Home/Home";
import { getEventRoutes } from "./Pages/Events/EventRoutes";
import Board from "./Pages/Board/Board";
import Alumni from "./Pages/Board/Alumni";
import Projects from "./Pages/Projects/Projects";
import DataHacks from "./Pages/DataHacks/DataHacks";
import Partners from "./Pages/Partners/Partners";
import JoinUs from "./Pages/JoinUs/JoinUs";

const Main = () => {
  const eventRoute = getEventRoutes();

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path={eventRoute.path}>
        {eventRoute.children.map((child, i) => (
          <Route key={i} {...child} />
        ))}
      </Route>
      <Route path="/board">
        <Route index element={<Board />} />
        <Route path="alumni" element={<Alumni />} />
      </Route>
      <Route path="/projects" element={<Projects />} />
      <Route path="/datahacks" element={<DataHacks />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/join-us" element={<JoinUs />} />
    </Routes>
  );
};

export default Main;
