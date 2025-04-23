import { useState } from "react";
import { Committee, LinkType, MemberType } from "../../Utils/types";
import members from "../../Assets/Data/members.json";
import committees from "../../Assets/Data/committees.json";
import Page from "../Page/Page";
import Star from "../../Components/Star";
import SelectCommittee from "./SelectCommittee";
// import MemberCard from "./MemberCard";
import { unbreakable } from "../../Utils/functions";
import HoverCard from "../../Components/HoverCard";
import { IoMail } from "react-icons/io5";
import { FaGlobe, FaLinkedin } from "react-icons/fa6";
import { IoIosDocument } from "react-icons/io";

const formatMemberLinks = ({ email, website, linkedIn, resume }: MemberType) =>
  [
    email && {
      title: "Email",
      icon: <IoMail />,
      href: `mailto:${email}`,
      color: "#F58134",
    },
    linkedIn && {
      title: "LinkedIn",
      icon: <FaLinkedin />,
      href: linkedIn,
      color: "#11B3C9",
    },
    resume && {
      title: "Resume",
      icon: <IoIosDocument />,
      href: resume,
      color: "#434343",
    },
    website && {
      title: "Website",
      icon: <FaGlobe />,
      href: website,
      color: "#222222",
    },
  ].filter(Boolean) as LinkType[];

const Board = () => {
  const typedMembers = members as MemberType[];
  const [committee, setCommittee] = useState<Committee>(Object.keys(committees)[0] as Committee);
  const filteredMembers = typedMembers.filter((member) => member.committees?.includes(committee));

  return (
    <Page>
      <div className="flex flex-col lg:flex-row items-center lg:items-start pt-20 pb-10 px-[clamp(1.5rem,10vw,12rem)] gap-[clamp(2rem,5vw,8rem)] relative">
        <Star size={0.9} className="absolute top-8 right-8" />
        <Star size={1.1} className="absolute top-10 right-14" />

        <SelectCommittee committee={committee} setCommittee={setCommittee} />

        <div className="w-full flex flex-col gap-4">
          <h1 className="text-[clamp(1.8rem,5vw,2.5rem)] font-medium text-center lg:text-left">
            {"Meet our "}
            <span className="text-(--color-primary) text-glow">{committee}</span>
            {committee !== "Alumni" && unbreakable(" Team")}!
          </h1>
          <p className="text-[clamp(1.1rem,1.5vw,1.4rem)] font-light px-[clamp(1rem,3vw,5rem)] lg:px-0 indent-8 lg:indent-0">
            {committees[committee]}
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-y-8 py-12">
            {filteredMembers.map((member, index) => (
              <HoverCard
                key={index}
                title={member.name}
                subtitle={member.role}
                image={member.image}
                links={formatMemberLinks(member)}
              />
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Board;
