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

  return error ? (
    <div className="flex justify-center items-center h-[80vh]">
      <Error message={error!} />
    </div>
  ) : sortedEvents.length > 0 ? (
    <>
      <div className="w-full grid grid-cols-[repeat(auto-fit,clamp(100px,80vw,300px))] xl:grid-cols-[repeat(auto-fit,clamp(200px,37vw,400px))] justify-center items-center gap-5 2xl:gap-x-6 my-20">
        {loading
          ? newArray(3).map((_, index) => (
              <EventCard key={index} event={{} as EventType} delay={0.2 * index} />
            ))
          : sortedEvents
              .slice(start, end)
              .map((event, index) => <EventCard key={index} event={event} delay={0.2 * index} />)}
      </div>
      <Paginate page={page} numPages={numPages} setPage={setPage} />
    </>
  ) : (
    <span className="text-[clamp(20px,2vw,40px)] text-balance text-center p-20">
      No events found, check our social media for the most up-to-date news!!
    </span>
  );
};

export default EventList;
