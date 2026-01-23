import { useState } from "react";
import teams from "./Data/teams.json";
import Page from "src/Components/Page/Page";
import Star from "src/Components/Star";
import SelectTeam from "./Components/SelectTeam";
import MemberCards from "./Components/MemberCards";

// "Consulting": "Our consulting committee meets with external companies and faculty to create new DS3 events and opportunities. They build partnerships that enhance our offerings and connect our organization with the broader data science community.",
//   "Alumni": "The alumni committee helps maintain a strong community of former DS3 members. They provide networking opportunities for alumni to connect with current members and share their experiences."

const Board = () => {
  const [team, setTeam] = useState<string>(Object.keys(teams)[0]);

  return (
    <Page>
      <div className="flex flex-col lg:flex-row items-center lg:items-start pt-20 pb-10 px-[clamp(1.5rem,10vw,12rem)] gap-[clamp(2rem,5vw,8rem)] relative">
        <Star size={0.9} className="absolute top-8 right-8" />
        <Star size={1.1} className="absolute top-10 right-14" />

        <SelectTeam team={team} setTeam={setTeam} />
        <MemberCards team={team} />
      </div>
    </Page>
  );
};

export default Board;
