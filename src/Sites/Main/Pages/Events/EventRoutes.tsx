import EventPage from "src/Shared/Events/EventPage";

import eventsData from "./Data/events.json";
import EventTemplate from "./EventTemplate";

export function getEventRoutes() {
  const { gbm, social, professional, leetcode } = eventsData;

  return {
    path: "/events",
    children: [
      { index: true, element: <EventPage defaultTime="Upcoming" /> },
      // { path: "upcoming", element: <EventTemplate team={upcoming} /> },
      { path: "gbm", element: <EventTemplate team={gbm} /> },
      { path: "social", element: <EventTemplate team={social} /> },
      { path: "professional", element: <EventTemplate team={professional} /> },
      { path: "leetcode", element: <EventTemplate team={leetcode} /> }
    ],
  };
}
