import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { EventType } from "../Utils/types";
import { newArray } from "../Utils/functions.tsx";
import SafeLink from "./SafeLink";
import useImagePreloader from "../Hooks/useImagepreload.tsx";
import { memo } from "react";

const BrowserCard = memo(function BrowserCard({
  title,
  date,
  link,
  location,
  image,
  description,
  delay,
}: EventType & { delay: number }) {
  const navigate = useNavigate();
  const notEvent = link?.startsWith("www.ds3ucsd.com");
  const ImagePreloader = useImagePreloader([image ? image : ""]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay,
      }}
      className={`relative w-full h-full pt-6 px-10 pb-6 rounded-2xl bg-[var(--bg-color)] border border-[var(--initial-border-color)] hover:border-[var(--border-color)] duration-150 flex flex-col gap-2 group ${
        notEvent ? "cursor-pointer" : ""
      }`}
      onClick={
        notEvent
          ? () => navigate(link.replace("www.ds3ucsd.com", ""))
          : undefined
      }
    >
      <div className="flex justify-between items-center gap-6 mb-2">
        <span className="w-[80%] h-6 px-4  truncate rounded-full text-[var(--link-textcolor)] bg-base-300 hover:underline">
          {notEvent && link}
        </span>
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-[#F58134] rounded-full" />
          <span className="w-3 h-3 bg-[#11B3C9] rounded-full" />
          <span className="w-3 h-3 bg-[#434343] rounded-full" />
        </div>
      </div>

      <div className="pl-2 flex flex-col">
        <h4 className="text-3xl font-normal">{title}</h4>
        <p className="text-lg opacity-75">
          {date && <span>{date}</span>}
          {date && location && <span> | </span>}
          {location && <span>{location}</span>}
        </p>
      </div>

      <div className="group overflow-hidden relative rounded-lg inline-block">
        {image && ImagePreloader.imagesPreloaded ? (
          <img
            src={image}
            alt={title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="skeleton w-full aspect-[1.4/1] rounded-lg" />
        )}
      </div>

      {description ? (
        <p className="text-lg font-light mt-2 line-clamp-5 text-[var(--card-textcolor)]">
          {description}
        </p>
      ) : (
        <div className="md:max-h-[35%] overflow-y-auto w-full">
          {newArray(4).map((_, index) => (
            <div className="h-7 m-1 w-auto skeleton" key={index} />
          ))}
        </div>
      )}

      {!notEvent &&
        (link ? (
          <SafeLink
            href={link}
            className="text-lg text-center font-semibold rounded-md bg-(--color-primary) w-[60%] self-start hover:brightness-110 mt-4 p-2"
          >
            Add to Calendar
          </SafeLink>
        ) : (
          <div className="h-10 m-1 mt-4 rounded-md w-[50%] skeleton" />
        ))}
    </motion.div>
  );
});

export default BrowserCard;
