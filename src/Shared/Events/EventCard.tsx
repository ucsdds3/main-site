import { useState } from "react";
import { motion } from "framer-motion";

import useImagePreloader from "src/Hooks/useImagepreload.tsx";
import SafeLink from "src/Shared/Components/SafeLink.tsx";
import { EventType } from "src/Utils/types.ts";
import { newArray, generateCalendarLink } from "src/Utils/functions.tsx";

const TAG_ACCENT: Record<string, string> = {
  Workshop:     "#19B5CA",
  Social:       "#a78bfa",
  Professional: "#F58134",
  Default:      "rgba(255,255,255,0.3)",
};

const EventCard = ({ event, delay }: { event: EventType; delay: number }) => {
  const { name, description, image, points, start, end, location, tags, attended_at } = event;
  const { imageStates } = useImagePreloader([image ?? ""]);
  const [imageError, setImageError] = useState(false);

  const accent = TAG_ACCENT[(tags?.[0] as string) ?? ""] ?? TAG_ACCENT.Default;

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <style>{`
        .obs-ecard {
          position: relative;
          background: var(--obs-surface);
          border: 1px solid var(--obs-border);
          border-radius: 1.25rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .obs-ecard:hover {
          border-color: var(--obs-border-mid);
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
        }
        .obs-ecard-img {
          width: 100%; aspect-ratio: 16/9;
          overflow: hidden; position: relative;
          background: var(--obs-surface);
          flex-shrink: 0;
        }
        .obs-ecard-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.5s ease;
        }
        .obs-ecard:hover .obs-ecard-img img { transform: scale(1.04); }
        .obs-ecard-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.45) 100%);
          pointer-events: none;
        }
        .obs-skel {
          background: linear-gradient(90deg, var(--obs-surface) 0%, var(--obs-border) 50%, var(--obs-surface) 100%);
          background-size: 200% 100%;
          animation: obs-shimmer 1.8s ease-in-out infinite;
          border-radius: 6px;
        }
        @keyframes obs-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .obs-tag {
          display: inline-flex; align-items: center;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          font-family: ui-monospace, monospace;
          font-size: 0.58rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: 1px solid;
        }
        .obs-cal-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          border-radius: 9999px;
          font-family: ui-monospace, monospace;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(25,181,202,0.35);
          background: rgba(25,181,202,0.08);
          color: #19B5CA;
        }
        .obs-cal-btn:hover {
          background: rgba(25,181,202,0.18);
          border-color: rgba(25,181,202,0.7);
          box-shadow: 0 6px 20px rgba(25,181,202,0.15);
        }
      `}</style>

      <motion.div
        className="obs-ecard"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ type: "spring", stiffness: 90, damping: 22, delay }}
      >
        {/* Accent top line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, flexShrink: 0 }} />

        {/* Image */}
        <div className="obs-ecard-img">
          {image && imageStates[image] && !imageError ? (
            <>
              <img src={image} alt={name} onError={() => setImageError(true)} />
              <div className="obs-ecard-img-overlay" />
            </>
          ) : (
            <div className="obs-skel" style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.1rem 1.25rem 1.25rem", flex: 1 }}>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {tags.map(tag => {
                const c = TAG_ACCENT[tag as string] ?? TAG_ACCENT.Default;
                return (
                  <span key={tag} className="obs-tag" style={{ color: c, borderColor: `${c}44`, background: `${c}12` }}>
                    {tag}
                  </span>
                );
              })}
              {points && (
                <span className="obs-tag" style={{ color: "var(--obs-text-faint)", borderColor: "var(--obs-border)", background: "transparent" }}>
                  {points} pts
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)",
            fontWeight: 400,
            lineHeight: 1.25,
            color: "var(--obs-text-primary)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {name ?? <div className="obs-skel" style={{ height: 24, width: "70%" }} />}
          </h3>

          {/* Date / location */}
          {(start || location) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {start && (
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.65rem", letterSpacing: "0.1em", color: accent }}>
                  {formatDate(start)}
                  {end && ` · ${formatTime(start)} – ${formatTime(end)}`}
                </span>
              )}
              {location && (
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.62rem", letterSpacing: "0.08em", color: "var(--obs-text-faint)" }}>
                  {location}
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg, var(--obs-border), transparent)" }} />

          {/* Description */}
          {description ? (
            <p style={{
              fontFamily: "'Albert Sans', sans-serif",
              fontSize: "clamp(0.82rem, 1vw, 0.9rem)",
              lineHeight: 1.75,
              color: "var(--obs-text-muted)",
              fontWeight: 300,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}>
              {description}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
              {newArray(3).map((_, i) => (
                <div key={i} className="obs-skel" style={{ height: 10, width: i === 2 ? "55%" : "100%" }} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
            {attended_at ? (
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.1em",
                color: "#19B5CA",
              }}>
                ✓ Checked in · {new Date(attended_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}
              </span>
            ) : (
              start && end && (
                <SafeLink href={generateCalendarLink(event)} className="obs-cal-btn">
                  + Add to Calendar
                </SafeLink>
              )
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EventCard;