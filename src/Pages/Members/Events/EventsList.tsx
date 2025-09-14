import { useEffect, useState } from "react";
import Page from "../../../Components/Page/Page";
import { supabase } from "../../../Utils/supabase";
import BrowserCard from "../../../Components/BrowserCard";
import { EventType } from "../../../Utils/types";

export default function EventsList() {
  const [Events, setEvents] = useState<(EventType & { points: number })[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("Events")
        .select("title:name,description,image,points");
      if (data) {
        data.link = "";
        setEvents(data);
      }
    };
    fetchData();
  }, []);
  return (
    <Page>
      <div className="w-full grid grid-cols-[repeat(auto-fit,clamp(300px,80vw,600px))] xl:grid-cols-[repeat(auto-fit,clamp(400px,37vw,700px))] justify-center items-center gap-10 2xl:gap-x-20 mt-10">
        {Events.map((event) => {
          return (
            <BrowserCard
              {...{
                title: `${event.title}`,
                description: event.description,
                image: event.image,
                link: `${event.points} points`
              }}
            />
          );
        })}
      </div>
    </Page>
  );
}
