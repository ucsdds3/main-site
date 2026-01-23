import workshopImages from "./Data/workshops.json";
import profImages from "./Data/professional-events.json";
import socialImages from "./Data/social-events.json";
import eventsData from "./Data/events.json";
import EventPage from "./EventPage";

export function getEventRoutes() {
  const { upcoming, workshops, social, professional } = eventsData;

  return {
    path: "/events",
    children: [
      { index: true, element: <EventPage team={upcoming} /> },
      { path: "upcoming", element: <EventPage team={upcoming} /> },
      { path: "workshops", element: <EventPage team={workshops} images={workshopImages} /> },
      { path: "social", element: <EventPage team={social} images={socialImages} /> },
      { path: "professional", element: <EventPage team={professional} images={profImages} /> },
    ],
  };
}
