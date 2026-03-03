import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

import { newArray } from "src/Utils/functions.tsx";
import SafeLink from "src/Shared/Components/SafeLink";

interface BrowserCardProps {
  title: string;
  link?: string;
  image?: string;
  description?: string;
  delay?: number;
  linkText?: string;
}

const BrowserCard = memo(function BrowserCard({
  title,
  link,
  image,
  description,
  delay = 0,
  linkText = "View",
}: BrowserCardProps) {
  const navigate = useNavigate();
  const notEvent = link?.startsWith("www.ds3atucsd.com");
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Albert+Sans:wght@300;400;500&display=swap');

        .obs-card {
          position: relative;
          background: var(--obs-surface);
          border: 1px solid var(--obs-border);
          border-radius: 1.25rem;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .obs-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--obs-surface) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
          border-radius: inherit;
        }
        .obs-card:hover {
          border-color: rgba(25,181,202,0.35);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(25,181,202,0.15), inset 0 1px 0 var(--obs-border);
          transform: translateY(-4px);
        }
        .obs-card-clickable { cursor: pointer; }

        /* URL bar */
        .obs-urlbar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 0.75rem;
          height: 28px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--obs-border);
          font-family: ui-monospace, monospace;
          font-size: 0.65rem;
          color: var(--obs-text-faint);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: calc(100% - 70px);
          letter-spacing: 0.02em;
        }
        .obs-urlbar-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.7;
        }

        /* Traffic lights */
        .obs-tl { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
        .obs-tl span { width: 10px; height: 10px; border-radius: 50%; display: block; }

        /* Image container */
        .obs-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          overflow: hidden;
          background: rgba(0,0,0,0.2);
          flex-shrink: 0;
        }
        .obs-img-wrap img {
          width: 100%; height: 100%;
          object-fit: contain;
          display: block;
          background: #080e19;
        }

        /* Image overlay */
        .obs-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(5,8,15,0.6) 100%);
          pointer-events: none;
        }

        /* Skeleton lines */
        .obs-skel {
          background: linear-gradient(90deg, var(--obs-surface) 0%, var(--obs-border) 50%, var(--obs-surface) 100%);
          background-size: 200% 100%;
          animation: obs-shimmer 1.8s ease-in-out infinite;
          border-radius: 6px;
        }
        @keyframes obs-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* CTA button */
        .obs-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.4rem;
          border-radius: 9999px;
          font-family: ui-monospace, monospace;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--obs-text-primary);
          background: rgba(25,181,202,0.1);
          border: 1px solid rgba(25,181,202,0.3);
          transition: background 0.2s ease, border-color 0.2s ease,
                      box-shadow 0.2s ease, transform 0.2s ease;
          align-self: flex-start;
        }
        .obs-cta:hover {
          background: rgba(25,181,202,0.2);
          border-color: rgba(25,181,202,0.65);
          box-shadow: 0 6px 24px rgba(25,181,202,0.2);
          transform: translateY(-1px);
          color: #fff;
        }
        .obs-cta-arrow {
          transition: transform 0.2s ease;
        }
        .obs-cta:hover .obs-cta-arrow { transform: translateX(3px); }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ type: "spring", stiffness: 90, damping: 22, delay }}
        className={`obs-card ${notEvent ? "obs-card-clickable" : ""} w-full`}
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
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "1.1rem 1.25rem 1.25rem",
            flex: 1,
          }}
        >
          {/* Title */}
          <h4
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.2rem, 1.6vw, 1.5rem)",
              fontWeight: 400,
              lineHeight: 1.2,
              color: "var(--obs-text-primary)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h4>

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg, var(--obs-border) 0%, transparent 100%)" }} />

          {/* Description or skeleton */}
          {description ? (
            <p
              style={{
                fontFamily: "'Albert Sans', sans-serif",
                fontSize: "clamp(0.82rem, 1vw, 0.92rem)",
                lineHeight: 1.75,
                color: "var(--obs-text-muted)",
                fontWeight: 300,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
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
                <SafeLink href={link} className="obs-cta">
                  {linkText}
                  <span className="obs-cta-arrow">→</span>
                </SafeLink>
              ) : (
                <div className="obs-skel" style={{ height: 34, width: 100, borderRadius: 9999 }} />
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
});

export default BrowserCard;