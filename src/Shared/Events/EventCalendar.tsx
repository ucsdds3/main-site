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
          cursor: pointer;
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
        .obs-event-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(2, 8, 21, 0.78);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .obs-event-modal {
          width: min(720px, 100%);
          max-height: calc(100vh - 2rem);
          overflow: auto;
          border-radius: 1rem;
          border: 1px solid var(--obs-border, rgba(128,128,128,0.25));
          background: rgba(8, 16, 34, 0.98);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
        }
        .obs-event-modal-close {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
          color: var(--obs-text-primary);
          border-radius: 9999px;
          padding: 0.35rem 0.7rem;
          font-family: ui-monospace, monospace;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .obs-event-modal-meta {
          font-family: ui-monospace, monospace;
          font-size: 0.66rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.8);
        }
        .obs-event-modal-desc {
          font-family: 'Albert Sans', sans-serif;
          font-size: 0.95rem;
          line-height: 1.8;
          color: var(--obs-text-muted, rgba(255,255,255,0.8));
          white-space: pre-wrap;
          margin: 0;
        }
        .obs-cal-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          border-radius: 9999px;
          font-family: ui-monospace, monospace;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(25,181,202,0.35);
          background: rgba(25,181,202,0.08);
          color: #19B5CA;
        }
        .obs-cal-btn:hover {
          background: rgba(25,181,202,0.18);
          border-color: rgba(25,181,202,0.7);
          box-shadow: 0 6px 20px rgba(25,181,202,0.15);
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
        eventClick={handleEventClick}
      />
      {selectedEvent && (
        <div className="obs-event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="obs-event-modal" onClick={e => e.stopPropagation()}>
            {selectedEvent.image && (
              <img
                src={selectedEvent.image}
                alt={selectedEvent.name}
                style={{
                  width: "100%",
                  maxHeight: "280px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
            <div style={{ padding: "1.1rem 1.15rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontWeight: 400,
                    fontSize: "clamp(1.35rem, 2.3vw, 1.9rem)",
                    lineHeight: 1.2,
                    color: "var(--obs-text-primary)",
                  }}
                >
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
                <div className="obs-event-modal-meta" style={{ color: "rgba(255,255,255,0.7)" }}>
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

