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
  const imageLoaded = image ? imageStates[image] : false;

  const placementConfig = {
    1: { color: "bg-yellow-500", text: "1st" },
    2: { color: "bg-gray-400", text: "2nd" },
    3: { color: "bg-amber-600", text: "3rd" },
  };

  const placementBand = placementConfig[placement as keyof typeof placementConfig];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className={`relative group ${imgClassName} ${link ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (links) setShowLinks(!showLinks);
          else if (link) window.open(link, "_blank");
        }}
        style={{
          width: size,
          height: size,
          borderRadius: "1rem",
          overflow: "hidden",
          background: "var(--obs-surface, rgba(128,128,128,0.08))",
        }}
      >
        {/* Skeleton pulse while loading */}
        {image && !imageLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "1rem",
              background:
                "linear-gradient(90deg, var(--obs-surface, rgba(128,128,128,0.06)) 0%, rgba(128,128,128,0.12) 50%, var(--obs-surface, rgba(128,128,128,0.06)) 100%)",
              backgroundSize: "200% 100%",
              animation: "hc-shimmer 1.6s ease-in-out infinite",
            }}
          />
        )}

        {placement && placement <= 3 && (
          <div
            className={`absolute top-2 left-2 text-white font-bold px-4 py-1 rounded-full z-10 ${placementBand.color}`}
          >
            {placementBand.text}
          </div>
        )}

        {image && imageLoaded && (
          <img
            src={image}
            className="size-full object-cover rounded-2xl"
            loading="lazy"
            decoding="async"
            style={{
              animation: "hc-fadeIn 0.35s ease-out forwards",
            }}
            onError={e => (e.currentTarget.style.display = "none")}
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
        className="text-center flex flex-col gap-1.5"
        style={{ width: `calc(${size} * 0.95)` }}
      >
        {title && <span className="font-mono text-[1rem] font-bold uppercase tracking-[0.18em] text-(--obs-text-primary)">{title}</span>}
        {description && <span className="font-body font-light fl-text-sm/base leading-snug text-(--obs-text-primary) opacity-[0.75]">{description}</span>}
      </div>
    </div>
  );
};

export default HoverCard;
