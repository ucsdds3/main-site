import { Route } from "react-router";

import workshopData from "./Data/workshops.json";
import professionalData from "./Data/professional-events.json";
import socialData from "./Data/social-events.json";
import eventsData from "./Data/events.json";
import EventPage from "./EventPage";

export default function EventRoutes() {
  const { upcoming, workshops, social, professional } = eventsData;

  return (
    <Route path="/events">
      <Route index element={<EventPage team={upcoming} />} />
      <Route path="upcoming" element={<EventPage team={upcoming} />} />
      <Route path="workshops" element={<EventPage team={workshops} images={workshopData} />} />
      <Route path="social" element={<EventPage team={social} images={socialData} />} />
      <Route
        path="professional"
        element={<EventPage team={professional} images={professionalData} />}
      />
    </Route>
  );
}
