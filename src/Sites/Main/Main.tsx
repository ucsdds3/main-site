import { Route, Routes } from "react-router";

import Home from "./Pages/Home/Home";
import { getEventRoutes } from "./Pages/Events/EventRoutes";
import Board from "./Pages/Board/Board";
import Alumni from "./Pages/Board/Alumni";
import Projects from "./Pages/Projects/Projects";
import OpenSource from "./Pages/OpenSource/OpenSource";
import Consulting from "./Pages/Consulting/Consulting";
import Partners from "./Pages/Partners/Partners";
import TalentLens from "./Pages/TalentLens/TalentLens";
import TalentLensAuthGate from "./Pages/TalentLens/components/TalentLensAuthGate";

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
      <Route path="/opensource" element={<OpenSource />} />
      <Route path="/consulting" element={<Consulting />} />
      <Route path="/partners" element={<Partners />} />
      <Route
        path="/talentlens"
        element={
          <TalentLensAuthGate>
            <TalentLens />
          </TalentLensAuthGate>
        }
      />
    </Routes>
  );
};

export default Main;
