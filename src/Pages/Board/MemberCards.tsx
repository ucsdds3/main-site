import { unbreakable } from "../../Utils/functions";
import { CommitteeType, LinkType, MemberType } from "../../Utils/types";
import committees from "../../Assets/Data/committees.json";
import members from "../../Assets/Data/members.json";
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

const MemberCards = ({ committee }: { committee: CommitteeType }) => {
  const typedMembers = members as MemberType[];
  const filteredMembers = typedMembers.filter((member) => member.committees?.includes(committee));

  return (
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
            size="240px"
            links={formatMemberLinks(member)}
          />
        ))}
      </div>
    </div>
  );
};

export default MemberCards;
