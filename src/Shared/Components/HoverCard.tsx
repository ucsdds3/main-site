import { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

import useImagePreloader from "src/Hooks/useImagepreload.tsx";
import SafeLink from "./SafeLink.tsx";

interface HoverCardProps {
  title: string;
  description?: string;
  size: string;
  image?: string;
  imgClassName?: string;
  placement?: number;
  link?: string;
  links?: {
    title: string;
    href: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

const HoverCard = ({
  title,
  description,
  size,
  image,
  link,
  links,
  imgClassName,
  placement,
}: HoverCardProps) => {
  const { imageStates } = useImagePreloader([image ? image : ""]);
  const [showLinks, setShowLinks] = useState(false);

  const placementConfig = {
    1: { color: "bg-yellow-500", text: "1st" },
    2: { color: "bg-gray-400", text: "2nd" },
    3: { color: "bg-amber-600", text: "3rd" },
  };

  const placementBand = placementConfig[placement as keyof typeof placementConfig];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className={`skeleton relative group ${imgClassName} ${link ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (links) setShowLinks(!showLinks);
          else if (link) window.open(link, "_blank");
        }}
        style={{ width: size, height: size }}
      >
        {placement && placement <= 3 && (
          <div
            className={`absolute top-2 left-2 text-white font-bold px-4 py-1 rounded-full z-10 ${placementBand.color}`}
          >
            {placementBand.text}
          </div>
        )}

        {image && imageStates[image] && (
          <img
            src={image || "/"}
            className="size-full object-cover rounded-2xl"
            onError={e => (e.currentTarget.style.display = "none")}
            onLoad={e => (e.currentTarget.style.display = "block")}
          />
        )}

        {link && (
          <div className="hidden group-hover:flex absolute top-2 right-2 animate-[hoverCardAnimate_0.2s]">
            <SafeLink
              href={link}
              title="View Project"
              className="btn p-3 text-lg text-(--color-primary-content)"
            >
              <FaExternalLinkAlt />
            </SafeLink>
          </div>
        )}

        {links && (
          <div
            className={`${showLinks ? "flex" : "hidden"} md:hidden md:group-hover:flex absolute bottom-[5%] w-full gap-[5%] justify-center animate-[hoverCardAnimate_0.2s]`}
            onClick={e => e.stopPropagation()}
          >
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
        {title && (
          <span
            className="text-2xl"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </span>
        )}
        {description && <span className="text-xl opacity-75 font-medium">{description}</span>}
      </div>
    </div>
  );
};

export default HoverCard;
