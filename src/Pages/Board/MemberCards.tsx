import { formatMemberLinks, unbreakable } from "../../Utils/functions.tsx";
import { CommitteeType, MemberType } from "../../Utils/types";
import committees from "../../Assets/Data/committees.json";
import members from "../../Assets/Data/members.json";
import { lazy, Suspense } from "react";
const HoverCard = lazy(() => {
  return import("../../Components/HoverCard");
});

const MemberCards = ({ committee }: { committee: CommitteeType }) => {
  const typedMembers = members as MemberType[];
  const filteredMembers = typedMembers.filter((member) =>
    member.committees?.includes(committee)
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-[clamp(1.8rem,5vw,2.5rem)] font-medium text-center lg:text-left">
        {"Meet our "}
        <span className="text-(--color-primary) text-glow">{committee}</span>
        {/* {committee !== "Alumni" && unbreakable(" Team")}! */}
        {unbreakable(" Team")}!
      </h1>
      <p className="text-[clamp(1.1rem,1.5vw,1.4rem)] font-light px-[clamp(1rem,3vw,5rem)] lg:px-0 indent-8 lg:indent-0">
        {committees[committee]}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-y-8 py-12">
        {filteredMembers.map((member, index) => (
          <Suspense fallback={<div className="w-full" />}>
            <HoverCard
              key={index}
              title={member.name}
              description={member.role}
              image={member.image}
              size="240px"
              links={formatMemberLinks(member)}
            />
          </Suspense>
        ))}
      </div>
    </div>
  );
};

export default MemberCards;
