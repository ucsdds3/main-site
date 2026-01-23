import { newArray } from "src/Utils/functions";
import { EventType } from "src/Utils/types";
import Section from "src/Shared/Page/Section";
import Page from "src/Shared/Page/Page";

import Error from "./Error";
import EventCard from "./EventCard";
import useEvents from "./useEvents";

type EventsProps = {
  filter?: (event: EventType) => boolean;
  section?: boolean;
  ascending?: boolean;
};

export default function Events({ filter, section, ascending }: EventsProps) {
  const { events, loading, error } = useEvents();
  const filteredEvents = filter ? events.filter(filter) : events;
  const sortedEvents = ascending
    ? filteredEvents.sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime())
    : filteredEvents.sort((a, b) => new Date(b.start!).getTime() - new Date(a.start!).getTime());

  const list = () => {
    return error ? (
      <div className="flex justify-center items-center h-[80vh]">
        <Error message={error!} />
      </div>
    ) : sortedEvents.length > 0 ? (
      <div className="w-full grid grid-cols-[repeat(auto-fit,clamp(100px,80vw,300px))] xl:grid-cols-[repeat(auto-fit,clamp(200px,37vw,400px))] justify-center items-center gap-5 2xl:gap-x-6 my-10">
        {loading
          ? newArray(3).map((_, index) => (
              <EventCard key={index} event={{} as EventType} delay={0.2 * index} />
            ))
          : sortedEvents.map((event, index) => (
              <EventCard key={index} event={event} delay={0.2 * index} />
            ))}
      </div>
    ) : (
      <span className="text-[clamp(20px,2vw,40px)] text-balance text-center p-20">
        No events found, check our social media for the most up-to-date news!!
      </span>
    );
  };

  return section ? <Section className="lg:w-full">{list()}</Section> : <Page>{list()}</Page>;
}
