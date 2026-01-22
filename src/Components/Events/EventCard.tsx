import { motion } from "framer-motion";
import { newArray, generateCalendarLink } from "../../Utils/functions.tsx";
import useImagePreloader from "../../Hooks/useImagepreload.tsx";
import { useState } from "react";
import { EventTagType, EventType } from "../../Utils/types.ts";
import SafeLink from "../SafeLink.tsx";

const EventCard = ({ event, delay }: { event: EventType, delay: number }) => {
  const { name, description, image, points, start, end, location, tags } = event;
  const { imageStates } = useImagePreloader([image ? image : ""]);
  const [imageError, setImageError] = useState(false);

  const tagColors: Record<EventTagType, string> = {
    "Professional": "badge-info",
    "Workshop": "badge-warning",
    "Social": "badge-success",
    "Other": ""
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: delay
      }}
      className="card size-full bg-base-400 rounded-2xl group"
    >
      <figure className="w-full overflow-hidden relative aspect-[16/9]">
        {image && imageStates[image] && !imageError ? (
          <img
            src={image}
            alt={name}
            className="object-cover size-full transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            style={{ display: "block" }}
          />
        ) : (
          <div className="skeleton size-full aspect-[16/9]" />
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title text-2xl line-clamp-3 capitalize">{name}</h2>

        <p>
        {start && end && (
            <span>
            {new Date(start).toLocaleDateString()} {new Date(start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })} - {new Date(end).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </span>
        )}
        {location && (
          <span>
            {" | " + location}
          </span>
        )}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <div className="badge badge-primary">
            {points} points
          </div>
          {tags?.map(tag => (
            <div className={`badge ${tagColors[tag as EventTagType] || ""}`} key={tag}>
              {tag}
            </div>
          ))}
        </div>
        {description ? (
          <p className={`line-clamp-3 text-xl font-light text-[var(--card-textcolor)]`}>
            {description}
          </p>
        ) : (
          <div className="md:max-h-[35%] overflow-y-auto w-full">
            {newArray(4).map((_, index) => (
              <div className="h-7 m-1 w-auto skeleton" key={index} />
            ))}
          </div>
        )}
        {event.start && event.end && (
          <div className="card-actions justify-start mt-auto pt-2">
            <SafeLink
              href={generateCalendarLink(event)}
              className="btn text-lg btn-primary"
            >
              Add to Calendar
            </SafeLink>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
