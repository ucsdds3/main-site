import { hideImage } from "../Utils/functions";
import SafeLink from "./SafeLink";

interface HoverCardProps {
  title: string;
  subtitle?: string;
  size: string;
  image?: string;
  links?: {
    title: string;
    href: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

const HoverCard = ({ title, subtitle, size, image, links }: HoverCardProps) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="skeleton relative group" style={{ width: size, height: size }}>
        <img
          src={image}
          className="size-full object-cover rounded-2xl"
          onError={hideImage}
        />

        {/* TODO: Animate on hover */}
        {links && (
          <div className="hidden group-hover:flex absolute bottom-0 w-full pb-2 gap-2 justify-center">
            {links.map(({ title, href, icon, color }, index) => (
              <SafeLink
                key={index}
                href={href}
                title={title}
                style={{ backgroundColor: color }}
                className="btn p-3 text-lg text-(--color-primary-content)"
              >
                {icon}
              </SafeLink>
            ))}
          </div>
        )}
      </div>

      <div className="text-lg flex flex-col" style={{ width: `calc(${size} * 0.95)` }}>
        {title && <span className="text-2xl font-medium">{title}</span>}
        {subtitle && <span className="text-xl opacity-75 font-medium">{subtitle}</span>}
      </div>
    </div>
  );
};

export default HoverCard;
