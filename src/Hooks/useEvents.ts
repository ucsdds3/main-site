import { useEffect, useState } from "react";
import { supabase } from "../Utils/supabase";
import { EventType } from "../Utils/types";
import { toast } from "react-hot-toast";

function useEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("Events")
        .select("name,description,image,points,deleted,password,datetime,tags")
        .eq("deleted", false)
        .order("datetime", { ascending: false });
      if (data) setEvents(data);

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