import SafeLink from "./SafeLink";

interface HoverCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  links?: Record<string, React.ReactNode>;
}

const HoverCard = ({ title, subtitle, image, links }: HoverCardProps) => {
  const colors = ["bg-[#F58134]", "bg-[#19B5CA]", "bg-[#434343]"];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="skeleton w-[240px] aspect-square rounded-xl relative group">
        <img
          src={image}
          className="size-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {links && <div className="hidden group-hover:flex absolute bottom-0 right-0 p-4 gap-4">
          {Object.entries(links).map(([link, icon], index) => (
            <SafeLink key={index} href={link} className={`btn btn-sm ${colors[index % 3]}`}>
              {icon}
            </SafeLink>
          ))}
        </div>}
      </div>

      <div className="text-lg flex flex-col">
        {title && <span className="text-2xl font-medium">{title}</span>}
        {subtitle && <span className="text-xl opacity-75 font-medium">{subtitle}</span>}
      </div>
    </div>
  );
};

export default HoverCard;
