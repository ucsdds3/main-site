import SafeLink from "./SafeLink";

interface HoverCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  links?: {
    title: string;
    href: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

const HoverCard = ({ title, subtitle, image, links }: HoverCardProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="skeleton size-[240px] relative group">
        <img
          src={image}
          className="size-full object-cover rounded-2xl"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {links && (
          <div className="hidden group-hover:flex absolute bottom-0 w-full pb-2 gap-2 justify-center">
            {links.map(({ title, href, icon, color }, index) => (
              <SafeLink
                key={index}
                href={href}
                title={title}
                style={{ backgroundColor: color }}
                className="btn text-lg text-(--color-primary-content)"
              >
                {icon}
              </SafeLink>
            ))}
          </div>
        )}
      </div>

      <div className="text-lg flex flex-col w-[230px]">
        {title && <span className="text-2xl font-medium">{title}</span>}
        {subtitle && <span className="text-xl opacity-75 font-medium">{subtitle}</span>}
      </div>
    </div>
  );
};

export default HoverCard;
