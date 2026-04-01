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
    <motion.div
        className="obs-ecard"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ type: "spring", stiffness: 90, damping: 22, delay }}
      >
        {/* Accent top line */}
        <div
          className="h-0.5 shrink-0"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />

        {/* Image */}
        <div className="obs-ecard-img">
          {image && imageStates[image] && !imageError ? (
            <>
              <img src={image} alt={name} onError={() => setImageError(true)} />
              <div className="obs-ecard-img-overlay" />
            </>
          ) : (
            <div className="obs-skel h-full w-full" />
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-[1.1rem]">

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-[0.4rem]">
              {tags.map(tag => {
                const c = TAG_ACCENT[tag as string] ?? TAG_ACCENT.Default;
                return (
                  <span key={tag} className="obs-tag font-mono" style={{ color: c, borderColor: `${c}44`, background: `${c}12` }}>
                    {tag}
                  </span>
                );
              })}
              {points && (
                <span className="obs-tag border-(--obs-border) bg-transparent font-mono text-(--obs-text-faint)">
                  {points} pts
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-heading font-normal fl-text-lg/xl leading-tight text-(--obs-text-primary) m-0 line-clamp-3">
            {name ?? <div className="obs-skel h-6 w-[70%]" />}
          </h3>

          {/* Date / location */}
          {(start || location) && (
            <div className="flex flex-col gap-[0.2rem]">
              {start && (
                <span className="font-mono text-[0.65rem] tracking-widest" style={{ color: accent }}>
                  {formatDate(start)}
                  {end && ` · ${formatTime(start)} – ${formatTime(end)}`}
                </span>
              )}
              {location && (
                <span className="font-mono text-[0.62rem] tracking-[0.08em] text-(--obs-text-faint)">
                  {location}
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="obs-divider-fade" />

          {/* Description */}
          {description ? (
            <p className="font-body font-light fl-text-sm/base leading-[1.75] text-(--obs-text-muted) m-0 line-clamp-4 flex-1">
              {description}
            </p>
          ) : (
            <div className="flex flex-1 flex-col gap-[0.4rem]">
              {newArray(3).map((_, i) => (
                <div key={i} className={i === 2 ? "obs-skel h-2.5 w-[55%]" : "obs-skel h-2.5 w-full"} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-2">
            {attended_at ? (
              <span className="font-mono text-[0.62rem] tracking-widest text-[#19B5CA]">
                ✓ Checked in · {new Date(attended_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}
              </span>
            ) : (
              start && end && (
                <SafeLink href={generateCalendarLink(event)} className="obs-cal-btn font-mono">
                  + Add to Calendar
                </SafeLink>
              )
            )}
          </div>
        </div>
      </motion.div>
  );
};

export default EventCard;