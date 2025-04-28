import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface FlipCardProps {
  title: string;
  description: string;
  image?: string;
}

const FlipCard = ({ title, description, image }: FlipCardProps) => {
  const [isLockedFlipped, setIsLockedFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFlipped = isLockedFlipped || isHovered;
  const cardClass = "absolute inset-0 flex flex-col items-center justify-center gap-4 border hover:border-(--color-primary) rounded-2xl overflow-hidden bg-base-300 [backface-visibility:hidden]";
  const textContainerClass = "relative z-10 text-center px-8 h-[80%] flex flex-col gap-8 justify-start pt-6 w-full";

  return (
    <div
      className="col-span-1 h-96 [perspective:1000px] cursor-pointer flex justify-center"
      onClick={() => setIsLockedFlipped((prev) => !prev)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative max-w-[300px] w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front Side */}
        <div className={twMerge(cardClass, "[transform:rotateY(0deg)]")}>
          <img
            src={image}
            alt={title}
            className="absolute w-[80%] object-cover opacity-100 transition-opacity duration-300 left-1/2 top-[30%] transform -translate-x-1/2"
          />
          <div className={textContainerClass}>
            <h3 className="text-[clamp(1rem,3vw,1.25rem)] font-bold">{title}</h3>
          </div>
        </div>

        {/* Back Side */}
        <div className={twMerge(cardClass, "[transform:rotateY(180deg)]")}>
          <div className={textContainerClass}>
            <h3 className="text-[clamp(1rem,3vw,1.25rem)] font-bold">{title}</h3>
            <p className="indent-6 text-left leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
