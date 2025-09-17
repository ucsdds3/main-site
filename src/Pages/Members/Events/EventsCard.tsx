import { motion } from "framer-motion";
import { newArray } from "../../../Utils/functions.tsx";
// import SafeLink from "../../../Components/SafeLink.tsx";
import useImagePreloader from "../../../Hooks/useImagepreload.tsx";
import { memo, useState } from "react";
import { PortalEvent } from "./EventsList.tsx";
import CalendarIcon from "/Members/64px-Google_Calendar_icon_(2020).svg.png";
import { IoMdCloseCircleOutline } from "react-icons/io";
const BrowserCard = memo(function BrowserCard({ name, description, image, points }: PortalEvent) {
  const { imageStates } = useImagePreloader([image ? image : ""]);
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <>
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
        onClick={() => {
          if (!expanded) setExpanded(true);
        }}
        className={`relative w-full h-full cursor-pointer pt-6 px-6 pb-6 rounded-2xl bg-base-400 border max-w-[800px] border-[var(--initial-border-color)]  hover:border-[var(--border-color)] duration-150 flex flex-col gap-2 group `}
      >
        <div className="pl-2 flex items-end">
          <h4 className={`text-2xl font-bold line-clamp-3 capitalize`}>{name}</h4>
        </div>
        <div className="group w-full overflow-hidden relative rounded-lg inline-block">
          {image && imageStates[image] && !imageError ? (
            <img
              src={image}
              alt={name}
              className=" object-cover aspect-[1.8/1] transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              style={{ display: "block" }}
            />
          ) : (
            <div className="skeleton w-full aspect-[1.4/1] rounded-lg" />
          )}
        </div>
        <div className="text-sm bg-[var(--color-base-100)] w-fit px-2 rounded-lg border border-[var(--color-base-200)]">
          {points} point(s)
        </div>
        <div className="flex justify-between items-start">
          {description ? (
            <p className={`line-clamp-3 text-xl font-light mt-2 text-[var(--card-textcolor)]`}>
              {description}
            </p>
          ) : (
            <div className="md:max-h-[35%] overflow-y-auto w-full">
              {newArray(4).map((_, index) => (
                <div className="h-7 m-1 w-auto skeleton" key={index} />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {expanded && (
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
          onClick={() => {
            if (!expanded) setExpanded(true);
          }}
          className={`fixed top-0 bottom-0 right-0 left-0 m-[auto_auto] w-[calc(100vw-100px)] h-[calc(100vh-100px)] z-100 pt-6 px-10 pb-6 rounded-2xl bg-base-400 border max-w-[800px] border-[var(--initial-border-color)]  hover:border-[var(--border-color)] duration-50 flex flex-col gap-2 group `}
        >
          <div className="pl-2 flex items-end">
            <h4 className={`text-4xl font-bold line-clamp-3 capitalize`}>{name}</h4>

            <IoMdCloseCircleOutline
              onClick={() => setExpanded(false)}
              className="ml-auto cursor-pointer text-[var(--initial-border-color)] hover:text-[var(--border-color)] duration-150 text-2xl"
            />
          </div>
          <div className="group w-full overflow-hidden relative rounded-lg inline-block">
            {image && imageStates[image] && !imageError ? (
              <img
                src={image}
                alt={name}
                className=" object-cover aspect-[1.8/1] transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
                style={{ display: "block" }}
              />
            ) : (
              <div className="skeleton w-full aspect-[1.4/1] rounded-lg" />
            )}
          </div>
          <div className="text-sm bg-[var(--color-base-100)] w-fit px-2 rounded-lg border border-[var(--color-base-200)]">
            {points} point(s)
          </div>
          <div className="flex justify-between items-start">
            <div className="">
              <div className="">
                <strong>Event Code: </strong> 123123
              </div>
              {description ? (
                <p className={`text-xl font-light mt-2 text-[var(--card-textcolor)]`}>
                  {description}
                </p>
              ) : (
                <div className="md:max-h-[35%] overflow-y-auto w-full">
                  {newArray(4).map((_, index) => (
                    <div className="h-7 m-1 w-auto skeleton" key={index} />
                  ))}
                </div>
              )}
            </div>

            <a className="flex shrink-0 gap-1 items-center opacity-80 hover:opacity-100 cursor-pointer underline">
              <img src={CalendarIcon} alt="" className="h-5" />
              Add to Calendar
            </a>
          </div>
        </motion.div>
      )}
    </>
  );
});

export default BrowserCard;
