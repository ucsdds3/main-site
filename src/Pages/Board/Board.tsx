import { lazy, Suspense, useState } from "react";
import { CommitteeType } from "../../Utils/types";
import committees from "../../Assets/Data/committees.json";
import Page from "../Page/Page";
import Star from "../../Components/Star";
import SelectCommittee from "./SelectCommittee";
const MemberCards = lazy(() => {
  return import("./MemberCards");
});

const Board = () => {
  const [committee, setCommittee] = useState<CommitteeType>(
    Object.keys(committees)[0] as CommitteeType
  );

  return (
    <Page>
      <div className="flex flex-col lg:flex-row items-center lg:items-start pt-20 pb-10 px-[clamp(1.5rem,10vw,12rem)] gap-[clamp(2rem,5vw,8rem)] relative">
        <Star size={0.9} className="absolute top-8 right-8" />
        <Star size={1.1} className="absolute top-10 right-14" />

        <SelectCommittee committee={committee} setCommittee={setCommittee} />
        <Suspense>
          <MemberCards committee={committee} />
        </Suspense>
      </div>
    </Page>
  );
};

export default Board;
