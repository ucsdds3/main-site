import SafeLink from "../../Components/SafeLink";
import { MemberType } from "../../Utils/types";

const MemberCard = ({ image, name, website, linkedIn }: MemberType) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="skeleton w-[240px] aspect-square rounded-xl">
        <img
          src={image}
          className="size-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div className="text-lg flex flex-col">
        <span className="text-2xl font-medium">{name}</span>
        <SafeLink href={website || "#"} className="opacity-75" glow>
          Personal Website
        </SafeLink>
        <SafeLink href={linkedIn || "#"} className="opacity-75" glow>
          LinkedIn link
        </SafeLink>
      </div>
    </div>
  );
};

export default MemberCard;
