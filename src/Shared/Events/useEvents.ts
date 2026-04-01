import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";

import { supabase } from "src/Utils/supabase";
import { EventType } from "src/Utils/types";

/** DataHacks / hackathon entries are hidden from public event lists and calendars. */
function isDataHacksEvent(event: EventType): boolean {
  const name = (event.name ?? "").toLowerCase();
  const desc = (event.description ?? "").toLowerCase();
  const tags = event.tags ?? [];
  if (name.includes("datahacks") || name.includes("data hacks") || name.includes("datahack")) return true;
  if (desc.includes("datahacks")) return true;
  if (tags.some(t => String(t).toLowerCase().includes("datahacks"))) return true;
  return false;
}

function useEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("Events")
        .select("name,description,image,points,deleted,password,start,end,location,tags")
        .eq("deleted", false)
        .order("start", { ascending: false });
      if (data) setEvents(data.filter(e => !isDataHacksEvent(e)));

      if (error) {
        toast.error(error instanceof Error ? error.message : "An unknown error occurred");
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return { events, loading, error };
}

export default useEvents;
