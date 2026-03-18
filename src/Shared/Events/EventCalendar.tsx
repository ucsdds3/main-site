import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { EventContentArg, EventInput } from "@fullcalendar/core/index.js";

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
          location: event.location ?? "",
        },
      };
    });
}

function renderEventContent(eventInfo: EventContentArg) {
  return (
    <div style={{ overflow: "hidden" }}>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.58rem",
          letterSpacing: "0.1em",
          opacity: 0.85,
        }}
      >
        {eventInfo.timeText}
      </div>
      <div
        style={{
          fontFamily: "'Albert Sans', sans-serif",
          fontSize: "0.74rem",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
        title={eventInfo.event.title}
      >
        {eventInfo.event.title}
      </div>
    </div>
  );
}

export default function EventCalendar({ events }: { events: EventType[] }) {
  return (
    <div
      style={{
        width: "100%",
        border: "1px solid var(--obs-border, rgba(128,128,128,0.2))",
        borderRadius: "1rem",
        background: "var(--obs-surface, transparent)",
        overflow: "hidden",
      }}
    >
      <style>{`
        .fc {
          --fc-border-color: rgba(255, 255, 255, 0.14);
          --fc-page-bg-color: rgba(5, 10, 24, 0.82);
          --fc-neutral-bg-color: rgba(255, 255, 255, 0.04);
          --fc-neutral-text-color: rgba(255, 255, 255, 0.75);
          --fc-today-bg-color: rgba(25, 181, 202, 0.08);
          --fc-event-bg-color: rgba(25, 181, 202, 0.18);
          --fc-event-border-color: rgba(25, 181, 202, 0.5);
          --fc-event-text-color: #e8f8ff;
          --fc-button-bg-color: rgba(20, 30, 52, 0.95);
          --fc-button-border-color: rgba(255, 255, 255, 0.14);
          --fc-button-hover-bg-color: rgba(25, 181, 202, 0.2);
          --fc-button-hover-border-color: rgba(25, 181, 202, 0.55);
          --fc-button-active-bg-color: rgba(25, 181, 202, 0.3);
          --fc-button-active-border-color: rgba(25, 181, 202, 0.6);
          color: var(--obs-text-primary);
        }
        .fc .fc-toolbar {
          padding: 0.95rem 0.9rem 0.35rem;
        }
        .fc .fc-toolbar-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.45rem, 2vw, 1.9rem);
          font-weight: 400;
          color: var(--obs-text-primary);
        }
        .fc .fc-button {
          text-transform: lowercase;
          border-radius: 0.55rem !important;
          box-shadow: none !important;
        }
        .fc .fc-col-header-cell {
          background: rgba(0, 0, 0, 0.48);
        }
        .fc .fc-col-header-cell-cushion {
          color: rgba(255, 255, 255, 0.62);
          font-family: ui-monospace, monospace;
          font-size: 0.64rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.55rem 0;
        }
        .fc .fc-daygrid-day-number {
          color: rgba(255, 255, 255, 0.78);
          font-family: ui-monospace, monospace;
          font-size: 0.72rem;
          padding: 0.25rem 0.4rem 0 0;
        }
        .fc .fc-daygrid-day.fc-day-today {
          background: rgba(25, 181, 202, 0.1) !important;
        }
        .fc .fc-daygrid-event {
          border-radius: 0.45rem;
          padding: 0.1rem 0.22rem;
          margin-top: 0.16rem;
          margin-bottom: 0.16rem;
        }
        .fc .fc-event-title {
          font-weight: 500;
        }
        .fc .fc-daygrid-day-frame {
          min-height: 8.4rem;
        }
        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.14);
        }
      `}</style>
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
      />
    </div>
  );
}

