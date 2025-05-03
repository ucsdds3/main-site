import { useNavigate } from "react-router";
import { EventType } from "../Utils/types";
import { newArray } from "../Utils/functions.tsx";
import SafeLink from "./SafeLink";
import useImagePreloader from "../Hooks/useImagepreload.tsx";

const BrowserCard = ({ title, date, link, location, image, description }: EventType) => {
  const navigate = useNavigate();
  const notEvent = link?.startsWith("www.ds3ucsd.com");
  const ImagePreloader = useImagePreloader([image ? image : ""]);
  return (
    <div
      className={`relative w-full h-full p-4 rounded-lg border-1 hover:border-(--color-primary) duration-250 flex flex-col gap-2 group ${
        notEvent && "cursor-pointer"
      }`}
      onClick={notEvent ? () => navigate(link.replace("www.ds3ucsd.com", "")) : undefined}
    >
      <div className="flex justify-between items-center gap-6">
        <span className="w-[80%] h-6 px-4 truncate rounded-full bg-base-300 hover:underline">
          {notEvent && link}
        </span>
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-[#F58134] rounded-full" />
          <span className="w-3 h-3 bg-[#11B3C9] rounded-full" />
          <span className="w-3 h-3 bg-[#434343] rounded-full" />
        </div>
      </div>

      <div className="pl-2 flex flex-col">
        <h4 className="text-2xl font-normal">{title}</h4>
        <p className="text-lg opacity-75">
          {date && <span>{date}</span>}
          {date && location && <span> | </span>}
          {location && <span>{location}</span>}
        </p>
      </div>

      <div
        className={`group overflow-hidden relative rounded-md flex items-center justify-center ${
          notEvent ? "h-[300px]" : "h-[200px]"
        }`}
      >
        {image && ImagePreloader.imagesPreloaded ? (
          <img
            src={image}
            alt={title}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute top-0 skeleton z-1 w-full rounded-lg h-full" />
        )}
      </div>

      {description ? (
        <p className="text-lg line-clamp-5">{description}</p>
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
            className="text-lg text-center font-semibold rounded-md bg-(--color-primary) w-[50%] self-start hover:brightness-110 mt-4 p-2"
          >
            Add to Calendar
          </SafeLink>
        ) : (
          <div className="h-10 m-1 mt-4 rounded-md w-[50%] skeleton" />
        ))}
    </div>
  );
};

export default BrowserCard;
