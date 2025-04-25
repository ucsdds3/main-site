import { useState } from "react";

interface FlipCardProps {
  title: string;
  description: string;
  image?: string;
}

const FlipCard = ({ title, description, image }: FlipCardProps) => {
  const [isLockedFlipped, setIsLockedFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFlipped = isLockedFlipped || isHovered;

  return (
    <div
      className="w-[clamp(300px,20vw,300px)] h-96 [perspective:1000px] cursor-pointer"
      onClick={() => setIsLockedFlipped((prev) => !prev)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-white hover:border-[#19B5CA] rounded-[1.5vw] text-white overflow-hidden bg-black [backface-visibility:hidden] [transform:rotateY(0deg)]">
          <img
            src={image}
            alt={title}
            className="absolute w-[80%] object-cover opacity-100 transition-opacity duration-300 left-1/2 top-[30%] transform -translate-x-1/2"
          />
          <div className="relative z-10 text-center px-4 h-[80%] flex flex-col gap-4 justify-start pt-6 w-full">
            <h3 className="text-[clamp(15px,2.5vw,20px)] font-bold">{title}</h3>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-white rounded-[1.5vw] text-white bg-black overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="relative z-10 text-center px-4 h-[80%] flex flex-col gap-4 justify-start pt-6 w-full">
            <h3 className="text-[clamp(15px,2.5vw,20px)] font-bold">{title}</h3>
            <p className="text-left leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
