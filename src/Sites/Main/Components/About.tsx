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

  const mediaClass = twMerge(
    "absolute inset-0 block size-full",
    galleryImageFit === "contain" ? "object-contain" : "object-cover"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={twMerge("w-full", className)}
    >
      {/* Label + heading */}
      <div className="mb-8">
        <div className="mb-[0.85rem] flex items-center gap-[0.6rem]">
          <div className="obs-accent-bar-orange shrink-0" />
          <span className="text-eyebrow text-eyebrow-orange">
            {noAbout ? "Overview" : "About"}
          </span>
        </div>
        <h2 className="m-0 font-heading text-[clamp(2rem,3.5vw,3rem)] font-normal leading-tight text-(--obs-text-primary)">
          {noAbout ? name : `About ${name}`}
        </h2>
      </div>

      {/* Image + points */}
      <div className="about-grid grid grid-cols-1 items-center gap-[clamp(2rem,4vw,4rem)] md:grid-cols-2">
        {/* Clickable image with caption */}
        <div className="flex flex-col gap-3">
          <div
            onClick={advance}
            className={twMerge(
              "relative aspect-[4/3] w-full cursor-default overflow-hidden rounded-[0.625rem] bg-[rgba(0,0,0,0.2)]",
              galleryImageFit === "contain" && "mx-auto max-w-[min(100%,520px)]",
              isClickable && "cursor-pointer"
            )}
          >
            <div
              className="absolute inset-0 box-border"
              style={{ padding: innerPad }}
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
                    className={mediaClass}
                    onError={e => {
                      e.currentTarget.style.display = "none";
                    }}
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
                    className={mediaClass}
                    onError={e => {
                      e.currentTarget.style.display = "none";
                    }}
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
                    className="pointer-events-none absolute bottom-2.5 right-2.5 z-10 flex items-center gap-[0.35rem] rounded-[2rem] bg-[rgba(0,0,0,0.55)] px-2 py-[0.3rem] pl-2 backdrop-blur-[6px]"
                  >
                    <PadlockExploreIcon className="shrink-0 text-[#F58134]" />
                    <span className="whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.15em] text-white/80">
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
                className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-[rgba(0,0,0,0.38)]"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/90">
                  Next photo
                </span>
                <ChevronRightNextIcon className="text-white/90" />
              </motion.div>
            )}

            {/* Dot indicators */}
            {pool.length > 1 && (
              <div className="pointer-events-none absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-[5px]">
                {pool.map((_, i) => (
                  <div
                    key={i}
                    className="h-[5px] rounded-[3px] transition-[width,background] duration-300"
                    style={{
                      width: i === currentIndex ? 16 : 5,
                      background: i === currentIndex ? "#F58134" : "rgba(255,255,255,0.45)",
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
                className="flex items-center gap-2"
              >
                <div className="h-[1.5px] w-3 shrink-0 rounded-sm bg-[#F58134]" />
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-[0.55]">
                  {current.caption}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Points */}
        <div className="flex flex-col justify-center gap-[clamp(1.25rem,2vw,2rem)]">
          {Object.entries(points ?? {}).map(([point, description], index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {index > 0 && (
                <div className="mb-[clamp(1.25rem,2vw,2rem)] h-px bg-(--obs-border)" />
              )}
              <div className="flex items-start gap-[0.85rem]">
                {!hidePointIcon && (
                  <span
                    aria-hidden
                    className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-[#F58134]"
                  />
                )}
                <div>
                  <p className="mb-[0.3rem] font-heading text-[clamp(1.25rem,1.5vw,1.6rem)] font-normal leading-tight text-(--obs-text-primary)">
                    {point}
                  </p>
                  <p className="m-0 text-[clamp(1.1rem,1vw,1.3rem)] leading-[1.65] text-(--obs-text-primary) opacity-[0.58]">
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
