import { useState } from "react";
import { EventTagType, EventType } from "src/Utils/types";
import Paginate from "src/Shared/Components/Paginate";
import { newArray } from "src/Utils/functions";

import Error from "./Error";
import EventCard from "./EventCard";
import useEvents from "./useEvents";

const PER_PAGE = 8;

interface EventListProps {
  tag?: EventTagType | "All";
  time?: "Past" | "Upcoming" | "All";
  ascending?: boolean;
}

const EventList = ({ tag = "All", time = "Upcoming", ascending = true }: EventListProps) => {
  const { events, loading, error } = useEvents();
  const [page, setPage] = useState(1);

  const TagEvents = tag === "All" ? events : events.filter(event => event.tags?.includes(tag));
  const TimeEvents =
    time === "All"
      ? TagEvents
      : TagEvents.filter(event =>
          time === "Past"
            ? new Date(event.start!) <= new Date()
            : new Date(event.start!) >= new Date()
        );
  const sortedEvents = [...TimeEvents].sort(
    (a, b) => (new Date(a.start!).getTime() - new Date(b.start!).getTime()) * (ascending ? 1 : -1)
  );

  const numPages = Math.ceil(sortedEvents.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageEvents = sortedEvents.slice(start, start + PER_PAGE);

  if (error) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Error message={error!} />
      </div>
    );
  }

  if (!loading && sortedEvents.length === 0) {
    return (
      <div className="obs-list-empty-panel">
        <p className="m-0 text-center font-heading font-normal fl-text-xl/3xl text-(--obs-text-primary) opacity-75">
          Nothing there yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(clamp(260px,28vw,360px),1fr))] fl-gap-4/6">
        {loading
          ? newArray(4).map((_, index) => (
              <EventCard key={index} event={{} as EventType} delay={0.1 * index} />
            ))
          : pageEvents.map((event, index) => (
              <EventCard key={`${page}-${index}`} event={event} delay={0.08 * index} />
            ))}
      </div>

      {numPages > 1 && (
        <div className="mt-8">
          <Paginate page={page} numPages={numPages} setPage={setPage} />
        </div>
      )}
    </>
  );
};

export default EventList;