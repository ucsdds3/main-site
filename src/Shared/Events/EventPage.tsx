import { useState } from "react";

import Page from "src/Shared/Page/Page";
import { EventTagType } from "src/Utils/types";
import Select from "src/Sites/Members/Components/Select";
import { tagColor } from "src/Utils/types";

import EventList from "./EventList";

type TimeType = "Past" | "Upcoming" | "All";

export default function EventPage({ defaultTime = "Upcoming" }: { defaultTime?: TimeType }) {
  const [tag, setTag] = useState<EventTagType | "All">("All");
  const [time, setTime] = useState<TimeType>(defaultTime);
  const [ascending, setAscending] = useState<boolean>(false);

  return (
    <Page>
      <div className="flex flex-col items-center gap-4 py-10 w-full">
        <h1 className="text-6xl font-bold">
          {`${time} ${tag === "All" ? "Events" : `${tag} Events`}`}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-4 px-10">
          <Select
            label="When"
            options={["Past", "Upcoming", "All"] as TimeType[]}
            value={time}
            setValue={(value: string) => setTime(value as TimeType)}
            className="w-[clamp(100px,80vw,200px)] min-w-0"
          />
          <Select
            label="Tag"
            options={["All", ...Object.keys(tagColor)]}
            value={tag}
            setValue={(value: string) => setTag(value as EventTagType)}
            className="w-[clamp(100px,80vw,200px)] min-w-0"
          />
          <Select
            label="Sort"
            options={["Ascending", "Descending"]}
            value={ascending ? "Ascending" : "Descending"}
            setValue={(value: string) => setAscending(value === "Ascending")}
            className="w-[clamp(100px,80vw,200px)] min-w-0"
          />
        </div>
        <EventList tag={tag} time={time} ascending={ascending} />
      </div>
    </Page>
  );
}
