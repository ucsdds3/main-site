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
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ type: "spring", stiffness: 90, damping: 22, delay }}
        className={`obs-card ${compact ? "obs-card-compact" : ""} ${notEvent ? "obs-card-clickable" : ""} w-full`}
        onClick={notEvent ? () => navigate(link?.replace("www.ds3atucsd.com", "") || "") : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1rem 0.75rem",
            borderBottom: "1px solid var(--obs-surface)",
          }}
        >
          <div className="obs-urlbar">
            <span
              className="obs-urlbar-dot"
              style={{ background: hovered ? "#19B5CA" : "var(--obs-text-faint)" }}
            />
            {link || "ds3atucsd.com"}
          </div>

          <div className="obs-tl">
            <span style={{ background: "#F58134", boxShadow: hovered ? "0 0 6px rgba(245,129,52,0.7)" : "none" }} />
            <span style={{ background: "#19B5CA", boxShadow: hovered ? "0 0 6px rgba(25,181,202,0.7)" : "none" }} />
            <span style={{ background: "rgba(255,255,255,0.15)" }} />
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
            <div className="obs-skel" style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        {/* ── Body ── */}
        <div
          className="obs-body"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: compact ? "0.95rem 1.1rem 1.1rem" : "1.1rem 1.25rem 1.25rem",
            flex: 1,
          }}
        >
          {/* Title */}
          <h4 className="font-heading font-normal fl-text-xl/2xl leading-tight text-(--obs-text-primary) m-0 line-clamp-3">
            {title}
          </h4>

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg, var(--obs-border) 0%, transparent 100%)" }} />

          {/* Description or skeleton */}
          {description ? (
            <p className="font-body font-light fl-text-sm/base leading-[1.75] text-(--obs-text-muted) m-0 line-clamp-4">
              {description}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {newArray(3).map((_, i) => (
                <div
                  key={i}
                  className="obs-skel"
                  style={{ height: 10, width: i === 2 ? "60%" : "100%" }}
                />
              ))}
            </div>
          )}

          {/* CTA */}
          {!notEvent && (
            <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
              {link ? (
                <SafeLink href={link} className="obs-cta w-fit flex items-center gap-1">
                  {linkText} <IoIosArrowForward />
                </SafeLink>
              ) : (
                <div className="obs-skel" style={{ height: 34, width: 100, borderRadius: 9999 }} />
              )}
            </div>
          )}
        </div>
      </motion.div>
  );
});

export default BrowserCard;