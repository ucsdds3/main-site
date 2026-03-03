import EventPage from "src/Shared/Events/EventPage";

import eventsData from "./Data/events.json";
import EventTemplate from "./EventTemplate";

export function getEventRoutes() {
  const { gbm, workshops, social, professional, leetcode } = eventsData;

  return {
    path: "/events",
    children: [
      { index: true, element: <EventPage defaultTime="All" /> },
      // { path: "upcoming", element: <EventTemplate team={upcoming} /> },
      { path: "gbm", element: <EventTemplate team={gbm} /> },
      { path: "workshops", element: <EventTemplate team={workshops} /> },
      { path: "social", element: <EventTemplate team={social} /> },
      { path: "professional", element: <EventTemplate team={professional} /> },
      { path: "leetcode", element: <EventTemplate team={leetcode} /> }
    ],
  };
}
