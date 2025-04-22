import SafeLink from "../../Components/SafeLink";
import { MemberType } from "../../Utils/types";

const MemberCard = ({ image, role, email, name, website, linkedIn }: MemberType) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="skeleton w-[240px] h-[240px] rounded-2xl overflow-hidden aspect-square border-radius">
        <img
          src={image}
          className="size-full object-cover"
          //onError={(e) => {
          //  e.currentTarget.style.display = "none";
          //}}
        />
      </div>

      <div className="text-lg flex flex-col">
      <SafeLink href={website || "#"} className="opacity-75" glow><span className="text-xl font-light">{name}</span></SafeLink>
        <span className="text-l font-bold">{role}</span>
        <SafeLink href={linkedIn || "#"} className="opacity-75" glow>
          LinkedIn
        </SafeLink>
      </div>
    </div>
  );
};

export default MemberCard;
