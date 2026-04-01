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
        className={`obs-card ${compact ? "obs-card-compact" : ""} ${notEvent ? "obs-card-clickable" : ""} w-full`}
        onClick={notEvent ? () => navigate(link?.replace("www.ds3atucsd.com", "") || "") : undefined}
      >
        {/* ── Top bar ── */}
        <div className="obs-card-topbar">
          <div className="obs-urlbar w-full">
            <span className="obs-urlbar-dot" />
            {link || "ds3atucsd.com"}
          </div>

          <div className="obs-tl">
            <span className="obs-tl-light-orange" />
            <span className="obs-tl-light-cyan" />
            <span className="obs-tl-light-muted" />
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
          className={`obs-card-body ${compact ? "obs-card-body--compact" : ""}`}
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
                <SafeLink href={link} className="obs-cta w-fit flex items-center gap-1">
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