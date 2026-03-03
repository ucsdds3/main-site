import { EventTagType, EventType } from "src/Utils/types";
import Paginate from "src/Shared/Components/Paginate";
import { usePaginate } from "src/Hooks/usePaginate";
import { newArray } from "src/Utils/functions";

import Error from "./Error";
import EventCard from "./EventCard";
import useEvents from "./useEvents";

interface EventListProps {
  tag?: EventTagType | "All";
  time?: "Past" | "Upcoming" | "All";
  ascending?: boolean;
}

const EventList = ({ tag = "All", time = "Upcoming", ascending = true }: EventListProps) => {
  const { events, loading, error } = useEvents();

  const TagEvents = tag === "All" ? events : events.filter(event => event.tags?.includes(tag));
  const TimeEvents =
    time === "All"
      ? TagEvents
      : TagEvents.filter(event =>
          time === "Past"
            ? new Date(event.start!) <= new Date()
            : new Date(event.start!) >= new Date()
        );
  const sortedEvents = TimeEvents.sort(
    (a, b) => (new Date(a.start!).getTime() - new Date(b.start!).getTime()) * (ascending ? 1 : -1)
  );

  const { page, setPage, numPages, start, end } = usePaginate({
    totalItems: sortedEvents.length,
    numRows: 2,
  });

  if (error) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Error message={error!} />
      </div>
    );
  }

  if (!loading && sortedEvents.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "4rem 2rem",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: "0.75rem",
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}
        >
          Nothing scheduled yet
        </span>
        <p
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
            fontWeight: 400,
            color: "var(--obs-text-primary)",
            textAlign: "center",
            margin: 0,
            opacity: 0.7,
          }}
        >
          Check our social media for the latest updates
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(260px, 30vw, 380px), 1fr))",
          gap: "clamp(1rem, 2vw, 1.5rem)",
        }}
      >
        {loading
          ? newArray(4).map((_, index) => (
              <EventCard key={index} event={{} as EventType} delay={0.1 * index} />
            ))
          : sortedEvents
              .slice(start, end)
              .map((event, index) => (
                <EventCard key={index} event={event} delay={0.1 * index} />
              ))}
      </div>

      {numPages > 1 && (
        <div style={{ marginTop: "2rem" }}>
          <Paginate page={page} numPages={numPages} setPage={setPage} />
        </div>
      )}
    </>
  );
};

export default EventList;