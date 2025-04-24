import { useState } from "react";
import cardData from "../../../Assets/Data/testimonials.json";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const PeopleCarousel = () => {
  const [index, setIndex] = useState(0);
  const card = cardData[index];
  const btnClass =
    "rounded-full hover:text-(--color-primary) p-3 hover:bg-base-300 transition-colors duration-300 cursor-pointer text-2xl md:mx-8";

  const handlePrev = () => {
    setIndex((prev) => (prev == 0 ? cardData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev == cardData.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full min-h-[550px] md:min-h-[400px] flex items-center justify-center gap-4 md:px-4">
      <button onClick={handlePrev} className={btnClass} aria-label="Previous">
        <IoIosArrowBack />
      </button>

      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-[clamp(1rem,6vw,6rem)]">
        <div className="md:w-auto w-full flex justify-center mb-6 md:mb-0">
          <img
            src={card.image}
            alt={card.title}
            className="w-[300px] aspect-square rounded-xl object-cover"
          />
        </div>

        <div className="md:w-1/2 w-full text-left font-albert-sans px-[clamp(1rem,3.5vw,3.5rem)] md:px-0">
          <h4 className="text-[clamp(1.2rem,4vw,2rem)] md:text-[clamp(1rem,2vw,2rem)] font-semibold mb-2">
            {card.title}
          </h4>
          <p className="text-[clamp(1rem,2.5vw,2rem)] md:text-[clamp(0.8rem,1.5vw,1.2rem)] mb-4 leading-relaxed opacity-75">
            {card.description}
          </p>
          <p className="text-[clamp(1rem,2.5vw,2rem)] md:text-[clamp(0.8rem,1.5vw,1.2rem)] font-light">
            {card.author}
          </p>
        </div>
      </div>

      <button onClick={handleNext} className={btnClass} aria-label="Next">
        <IoIosArrowForward />
      </button>
    </div>
  );
};

export default PeopleCarousel;
