import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { twMerge } from "src/Utils/cn";
import { TeamType } from "src/Utils/types.ts";
import { ChevronRightNextIcon } from "src/Shared/icons/ChevronRightNextIcon";
import { PadlockExploreIcon } from "src/Shared/icons/PadlockExploreIcon";

export interface AboutProps extends TeamType {
  noAbout?: boolean;
  className?: string;
  hidePointIcon?: boolean;
}

interface PhotoEntry {
  src: string;
  caption: string;
}

const isVideoFile = (src: string) => /\.(mp4|webm|ogg)$/i.test(src);

const About = ({
  name,
  image,
  photoPool,
  points,
  noAbout,
  className,
  hidePointIcon,
  galleryImageFit = "cover",
  galleryPadding,
}: AboutProps & { photoPool?: PhotoEntry[] }) => {
  if (!name || !image) return null;

  const pool: PhotoEntry[] = photoPool && photoPool.length > 0
    ? photoPool
    : [{ src: image, caption: "" }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);

  const advance = useCallback(() => {
    if (pool.length <= 1) return;
    setDirection(1);
    setHasClicked(true);
    setCurrentIndex(i => (i + 1) % pool.length);
  }, [pool.length]);

  const current = pool[currentIndex];
  const isClickable = pool.length > 1;
  const innerPad =
    galleryPadding ??
    (galleryImageFit === "contain" ? "clamp(0.75rem, 3vw, 2rem)" : "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={twMerge("w-full", className)}
    >
      {/* Label + heading */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
          <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2, flexShrink: 0 }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}>
            {noAbout ? "Overview" : "About"}
          </span>
        </div>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 3.5vw, 3rem)",
          fontWeight: 400,
          color: "var(--obs-text-primary)",
          margin: 0,
          lineHeight: 1.1,
        }}>
          {noAbout ? name : `About ${name}`}
        </h2>
      </div>

      {/* Image + points */}
      <div className="about-grid grid grid-cols-1 items-center gap-[clamp(2rem,4vw,4rem)] md:grid-cols-2">
        {/* Clickable image with caption */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            onClick={advance}
            style={{
              borderRadius: "0.625rem",
              overflow: "hidden",
              width: "100%",
              maxWidth: galleryImageFit === "contain" ? "min(100%, 520px)" : undefined,
              margin: galleryImageFit === "contain" ? "0 auto" : undefined,
              aspectRatio: "4/3",
              position: "relative",
              cursor: isClickable ? "pointer" : "default",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: innerPad,
                boxSizing: "border-box",
              }}
            >
              <AnimatePresence mode="wait" custom={direction}>
                {isVideoFile(current.src) ? (
                  <motion.video
                    key={currentIndex}
                    src={current.src}
                    custom={direction}
                    initial={{ opacity: 0, x: 24 * direction }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 * direction }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    controls
                    playsInline
                    preload="metadata"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: galleryImageFit,
                      display: "block",
                    }}
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <motion.img
                    key={currentIndex}
                    src={current.src}
                    custom={direction}
                    initial={{ opacity: 0, x: 24 * direction }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 * direction }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: galleryImageFit,
                      display: "block",
                    }}
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Persistent click hint — fades out after first click */}
            {isClickable && (
              <AnimatePresence>
                {!hasClicked && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(6px)",
                      borderRadius: "2rem",
                      padding: "0.3rem 0.65rem 0.3rem 0.5rem",
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  >
                    <PadlockExploreIcon className="shrink-0 text-[#F58134]" />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
                      Click to explore
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Hover overlay */}
            {isClickable && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.38)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  pointerEvents: "none",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.9)",
                }}>
                  Next photo
                </span>
                <ChevronRightNextIcon className="text-white/90" />
              </motion.div>
            )}

            {/* Dot indicators */}
            {pool.length > 1 && (
              <div style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "5px",
                pointerEvents: "none",
              }}>
                {pool.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === currentIndex ? 16 : 5,
                      height: 5,
                      borderRadius: 3,
                      background: i === currentIndex ? "#F58134" : "rgba(255,255,255,0.45)",
                      transition: "width 0.3s ease, background 0.3s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Caption */}
          <AnimatePresence mode="wait">
            {current.caption && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div style={{ width: 12, height: 1.5, background: "#F58134", borderRadius: 2, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--obs-text-primary)",
                  opacity: 0.55,
                }}>
                  {current.caption}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Points */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "clamp(1.25rem, 2vw, 2rem)" }}>
          {Object.entries(points ?? {}).map(([point, description], index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {index > 0 && (
                <div style={{
                  height: 1,
                  background: "var(--obs-border, rgba(128,128,128,0.15))",
                  marginBottom: "clamp(1.25rem, 2vw, 2rem)",
                }} />
              )}
              <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                {!hidePointIcon && (
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#F58134",
                      flexShrink: 0,
                      marginTop: "0.7rem",
                    }}
                  />
                )}
                <div>
                  <p style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.25rem, 1.5vw, 1.6rem)",
                    fontWeight: 400,
                    color: "var(--obs-text-primary)",
                    margin: "0 0 0.3rem 0",
                    lineHeight: 1.2,
                  }}>
                    {point}
                  </p>
                  <p style={{
                    fontSize: "clamp(1.1rem, 1vw, 1.3rem)",
                    color: "var(--obs-text-primary)",
                    opacity: 0.58,
                    margin: 0,
                    lineHeight: 1.65,
                  }}>
                    {description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};

export default About;