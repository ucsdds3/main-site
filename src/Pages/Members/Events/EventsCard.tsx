import { motion } from "framer-motion";
import { newArray } from "../../../Utils/functions.tsx";
// import SafeLink from "../../../Components/SafeLink.tsx";
import useImagePreloader from "../../../Hooks/useImagepreload.tsx";
import { memo, useState } from "react";
import { PortalEvent } from "./EventsList.tsx";

const BrowserCard = memo(function BrowserCard({ name, description, image, points }: PortalEvent) {
  const { imageStates } = useImagePreloader([image ? image : ""]);
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(true);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.2,
      }}
      className={`${
        expanded
          ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-100px)] h-[calc(100vh-100px)] z-100"
          : "relative w-full h-full"
      } pt-6 px-10 pb-6 rounded-2xl bg-base-400 border border-[var(--initial-border-color)] hover:border-[var(--border-color)] duration-150 flex flex-col gap-2 group cursor-pointer`}
    >
      <div className="pl-2 flex items-end">
        <h4 className="text-2xl font-bold line-clamp-3">{name}</h4>
        <h4 className="text-2xl w-8 text-center ml-auto border border-[var(--initial-border-color)] rounded-lg group-hover:border-[var(--border-color)] duration-150">
          {points}
        </h4>
      </div>
      <div className="group overflow-hidden relative rounded-lg inline-block">
        {image && imageStates[image] && !imageError ? (
          <img
            src={image}
            alt={name}
            className="object-cover aspect-[1.8/1] transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            style={{ display: "block" }}
          />
        ) : (
          <div className="skeleton w-full aspect-[1.4/1] rounded-lg" />
        )}
      </div>
      {description ? (
        <p className="text-xl font-light mt-2 line-clamp-5 text-[var(--card-textcolor)]">
          {description}
        </p>
      ) : (
        <div className="md:max-h-[35%] overflow-y-auto w-full">
          {newArray(4).map((_, index) => (
            <div className="h-7 m-1 w-auto skeleton" key={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
});

export default BrowserCard;
