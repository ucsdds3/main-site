import useImagePreloader from "../Hooks/useImagepreload.tsx";
import { hideImage } from "../Utils/functions.tsx";
import SafeLink from "./SafeLink";

interface HoverCardProps {
  title: string;
  description?: string;
  size: string;
  image?: string;
  links?: {
    title: string;
    href: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

const HoverCard = ({ title, description, size, image, links }: HoverCardProps) => {
  const ImagePreloader = useImagePreloader([image ? image : ""]);
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="skeleton relative group" style={{ width: size, height: size }}>
        {ImagePreloader.imagesPreloaded && (
          <img
            src={image || "/main-site/"}
            className="size-full object-cover rounded-2xl"
            onError={hideImage}
            onLoad={(e) => (e.currentTarget.style.display = "block")}
          />
        )}

        {/* TODO: Animate on hover */}
        {links && (
          <div className="hidden group-hover:flex absolute bottom-0 w-full pb-2 gap-2 justify-center animate-[hoverCardAnimate_0.2s]">
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

      <div
        className="text-lg text-center flex flex-col gap-2"
        style={{ width: `calc(${size} * 0.95)` }}
      >
        {title && <span className="text-2xl font-bold">{title}</span>}
        {description && <span className="text-xl opacity-75 font-medium">{description}</span>}
      </div>
    </div>
  );
};

export default HoverCard;
