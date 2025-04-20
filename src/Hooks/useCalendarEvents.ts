/* eslint-disable @typescript-eslint/no-explicit-any */
import { calendarID, calendarAPIKey } from "../Utils/config.ts";
import { useEffect, useState } from "react";
import { EventType } from "../Utils/types";

export function useCalendarEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?key=${calendarAPIKey}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const now = new Date();
        // console.log(data);

        const mappedEvents = (data.items || [])
          .filter((item: any) => {
            const startDate = new Date(
              item.start?.dateTime || item.start?.date
            );
            return startDate > now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(
              a.start?.dateTime || a.start?.date
            ).getTime();
            const dateB = new Date(
              b.start?.dateTime || b.start?.date
            ).getTime();
            return dateA - dateB;
          })
          .map((item: any) => {
            const start = new Date(item.start?.dateTime || item.start?.date);
            const end = new Date(item.end?.dateTime || item.end?.date);

            const formatDateForGoogle = (date: Date) =>
              date.toISOString().replace(/[-:]|\.\d{3}/g, "");

            const startUTC = formatDateForGoogle(start);
            const endUTC = formatDateForGoogle(end);

            const formattedDate = start.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            const formattedTime = start.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            });

            const rawUrl = item.attachments?.[0]?.fileUrl || null;
            const image =
              rawUrl?.includes("drive.google.com") && rawUrl.includes("id=")
                ? `https://drive.google.com/thumbnail?id=${new URL(
                    rawUrl
                  ).searchParams.get("id")}&sz=s1000`
                : rawUrl;

            const link = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
              item.summary || "No Title"
            )}&dates=${startUTC}/${endUTC}&details=${encodeURIComponent(
              item.description || ""
            )}&location=${encodeURIComponent(
              item.location || ""
            )}&sf=true&output=xml`;

            return {
              title: item.summary || "No Title",
              date: `${formattedDate} ${formattedTime}`,
              location: item.location || "No location",
              description: item.description || "No description",
              image,
              link
            };
          });
        // console.log(mappedEvents);

        setEvents(mappedEvents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        // TODO: Remove artificial delay
        setTimeout(() => setLoading(false), 5000);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}
