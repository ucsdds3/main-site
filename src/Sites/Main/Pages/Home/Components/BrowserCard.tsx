import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

import { newArray } from "src/Utils/functions.tsx";
import SafeLink from "src/Shared/Components/SafeLink";
import { IoIosArrowForward } from "react-icons/io";

interface BrowserCardProps {
  title: string;
  link?: string;
  image?: string;
  description?: string;
  delay?: number;
  linkText?: string;
  compact?: boolean;
}

const BrowserCard = memo(function BrowserCard({
  title,
  link,
  image,
  description,
  delay = 0,
  linkText = "View",
  compact = false,
}: BrowserCardProps) {
  const navigate = useNavigate();
  const notEvent = link?.startsWith("www.ds3atucsd.com");
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ type: "spring", stiffness: 90, damping: 22, delay }}
        className={`group obs-card ${compact ? "obs-card-compact" : ""} ${notEvent ? "obs-card-clickable" : ""} w-full`}
        onClick={notEvent ? () => navigate(link?.replace("www.ds3atucsd.com", "") || "") : undefined}
      >
        {/* ── Top bar ── */}
        <div className="relative z-10 flex items-center justify-between border-b border-(--obs-surface) px-4 pb-3 pt-[0.85rem]">
          <div className="obs-urlbar w-full">
            <span className="obs-urlbar-dot bg-(--obs-text-faint) transition-colors group-hover:bg-[#19b5ca]" />
            {link || "ds3atucsd.com"}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="block h-2.5 w-2.5 shrink-0 rounded-full bg-[#f58134] shadow-none transition-shadow group-hover:shadow-[0_0_6px_rgba(245,129,52,0.7)]" />
            <span className="block h-2.5 w-2.5 shrink-0 rounded-full bg-[#19b5ca] shadow-none transition-shadow group-hover:shadow-[0_0_6px_rgba(25,181,202,0.7)]" />
            <span className="block h-2.5 w-2.5 shrink-0 rounded-full bg-white/15" />
          </div>
        </div>

        {/* ── Image ── */}
        <div className="obs-img-wrap">
          {image && !imageError ? (
            <>
              <img
                src={image}
                alt={title}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => { console.log("Image error", e); setImageError(true); }}
              />
              <div className="obs-img-overlay" />
            </>
          ) : (
            <div className="obs-skel size-full" />
          )}
        </div>

        {/* ── Body ── */}
        <div
          className={`relative z-10 flex flex-1 flex-col gap-3 ${
            compact ? "px-[1.1rem] pb-[1.1rem] pt-[0.95rem]" : "px-5 pb-5 pt-[1.1rem]"
          }`}
        >
          {/* Title */}
          <h4 className="font-heading font-normal fl-text-xl/2xl leading-tight text-(--obs-text-primary) m-0 line-clamp-3">
            {title}
          </h4>

          {/* Divider */}
          <div className="obs-divider-fade" />

          {/* Description or skeleton */}
          {description ? (
            <p className="font-body font-light fl-text-sm/base leading-[1.75] text-(--obs-text-muted) m-0 line-clamp-4">
              {description}
            </p>
          ) : (
            <div className="flex flex-col gap-[0.4rem]">
              {newArray(3).map((_, i) => (
                <div
                  key={i}
                  className={`obs-skel h-2.5 ${i === 2 ? "w-[60%]" : "w-full"}`}
                />
              ))}
            </div>
          )}

          {/* CTA */}
          {!notEvent && (
            <div className="mt-auto pt-2">
              {link ? (
                <SafeLink
                  href={link}
                  className="obs-cta flex w-fit items-center gap-1 [&_svg]:transition-transform [&_svg]:duration-200 group-hover:[&_svg]:translate-x-1"
                >
                  {linkText} <IoIosArrowForward />
                </SafeLink>
              ) : (
                <div className="obs-skel h-[34px] w-[100px] rounded-full" />
              )}
            </div>
          )}
        </div>
      </motion.div>
  );
});

export default BrowserCard;