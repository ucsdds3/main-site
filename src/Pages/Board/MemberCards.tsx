import { formatMemberLinks, unbreakable } from "../../Utils/functions.tsx";
import { CommitteeType, MemberType } from "../../Utils/types";
import committees from "../../Assets/Data/committees.json";
import members from "../../Assets/Data/members.json";
import HoverCard from "../../Components/HoverCard.tsx";
import { memo } from "react";

const MemberCards = memo(function ({ committee }: { committee: CommitteeType }) {
  const typedMembers = members as MemberType[];
  const filteredMembers = typedMembers.filter((member) => member.committees?.includes(committee));

  return (
    <div className="w-full h-full flex flex-col gap-4 ">
      <h1 className="text-[clamp(1.8rem,5vw,2.5rem)] w-full font-medium text-center lg:text-left">
        {"Meet our "}
        <span className="text-(--color-primary) text-glow">{committee}</span>
        {/* {committee !== "Alumni" && unbreakable(" Team")}! */}
        {unbreakable(" Team")}!
      </h1>
      <p className="text-[clamp(1.1rem,1.5vw,1.4rem)] w-full font-light px-[clamp(1rem,3vw,5rem)] lg:px-0 indent-8 lg:indent-0">
        {committees[committee]}
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,260px)] h-full min-w-0 gap-y-8 py-12">
        {filteredMembers.map((member, index) => (
          <>
            <div className="animate-[hoverCardAnimate_1s]" key={committee + index}>
              <HoverCard
                title={member.name}
                description={member.role}
                image={member.image}
                size="240px"
                links={formatMemberLinks(member)}
              />
            </div>
          </>
        ))}
      </div>
    </div>
  );
});

export default MemberCards;
