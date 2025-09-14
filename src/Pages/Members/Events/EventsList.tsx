import { useEffect, useState } from "react";
import Page from "../../../Components/Page/Page";
import { supabase } from "../../../Utils/supabase";
import EventsCard from "./EventsCard";

export interface PortalEvent {
  name: string;
  description: string;
  image: string;
  points: number;
}

export default function EventsList() {
  const [Events, setEvents] = useState<PortalEvent[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("Events").select("name,description,image,points");
      if (data) {
        setEvents(data);
      }
      if (error) console.log(error);
    };
    fetchData();
  }, []);
  return (
    <Page>
      <div className="w-full grid grid-cols-[repeat(auto-fit,clamp(100px,80vw,300px))] xl:grid-cols-[repeat(auto-fit,clamp(200px,37vw,400px))] justify-center items-center gap-5 2xl:gap-x-6 mt-10">
        {Events.map((event) => {
          return <EventsCard {...event} />;
        })}
      </div>
    </Page>
  );
}
