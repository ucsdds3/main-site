import { useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core/index.js";

import SafeLink from "src/Shared/Components/SafeLink.tsx";
import { generateCalendarLink } from "src/Utils/functions.tsx";
import { EventType } from "src/Utils/types";

function isValidDate(value: string | undefined): value is string {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function toCalendarEvents(events: EventType[]): EventInput[] {
  return events
    .filter(event => isValidDate(event.start))
    .map(event => {
      const startDate = new Date(event.start!);
      const hasValidEnd = isValidDate(event.end);
      const endDate = hasValidEnd ? new Date(event.end!) : null;
      const isSameDayEnd = Boolean(
        endDate &&
          endDate.getFullYear() === startDate.getFullYear() &&
          endDate.getMonth() === startDate.getMonth() &&
          endDate.getDate() === startDate.getDate()
      );

      return {
        id: `${event.name}-${event.start}`,
        title: event.name,
        start: event.start!,
        // Prevent accidental multi-day spans for events that should be single-day.
        end: isSameDayEnd ? event.end : undefined,
        allDay: false,
        extendedProps: {
          eventData: event,
        },
      };
    });
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <div className="overflow-hidden">
      <div className="font-mono text-[0.58rem] tracking-widest opacity-[0.85]">
        {eventInfo.timeText}
      </div>
      <div
        className="truncate font-body text-[0.74rem] leading-tight"
        title={eventInfo.event.title}
      >
        {eventInfo.event.title}
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function EventCalendar({ events }: { events: EventType[] }) {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const handleEventClick = (arg: EventClickArg) => {
    const clicked = arg.event.extendedProps?.eventData as EventType | undefined;
    if (clicked) setSelectedEvent(clicked);
  };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-(--obs-border) bg-(--obs-surface,transparent)">
      <div className="obs-event-cal-scroll">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={toCalendarEvents(events)}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "",
          }}
          fixedWeekCount={false}
          showNonCurrentDates
          dayMaxEventRows={false}
          dayMaxEvents={false}
          height="auto"
          eventDisplay="block"
          eventOrder="start,-duration,title"
          eventContent={renderEventContent}
          eventClick={handleEventClick}
        />
      </div>
      {selectedEvent && (
        <div className="obs-event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="obs-event-modal" onClick={e => e.stopPropagation()}>
            {selectedEvent.image && (
              <img
                src={selectedEvent.image}
                alt={selectedEvent.name}
                className="block max-h-[280px] w-full object-cover"
              />
            )}
            <div className="flex flex-col gap-[0.9rem] px-[1.15rem] pb-[1.2rem] pt-[1.1rem]">
              <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 block font-heading font-normal fl-text-xl/3xl leading-tight tracking-tight text-(--obs-text-primary)">
                  {selectedEvent.name}
                </h3>
                <button className="obs-event-modal-close" onClick={() => setSelectedEvent(null)}>
                  Close
                </button>
              </div>

              {(selectedEvent.start || selectedEvent.end) && (
                <div className="obs-event-modal-meta">
                  {selectedEvent.start && formatDate(selectedEvent.start)}
                  {selectedEvent.start && ` · ${formatTime(selectedEvent.start)}`}
                  {selectedEvent.end && ` - ${formatTime(selectedEvent.end)}`}
                </div>
              )}

              {selectedEvent.location && (
                <div className="obs-event-modal-meta text-white/70">
                  {selectedEvent.location}
                </div>
              )}

              {selectedEvent.description && (
                <p className="obs-event-modal-desc">{selectedEvent.description}</p>
              )}

              {selectedEvent.start && selectedEvent.end && (
                <SafeLink href={generateCalendarLink(selectedEvent)} className="obs-cal-btn">
                  + Add to Calendar
                </SafeLink>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

