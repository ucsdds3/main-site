import { useState } from "react";
import cardData from "../../../Assets/Data/testimonials.json";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import useImagePreloader from "../../../Hooks/useImagepreload";

const PeopleCarousel = () => {
  const [index, setIndex] = useState(0);
  const ImagePreloader = useImagePreloader(cardData.map((daton) => daton.image));
  const btnClass =
    "rounded-full hover:text-(--color-primary) p-3 hover:bg-base-300 transition-colors duration-300 cursor-pointer text-2xl md:mx-8 z-100";

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

      <span className="w-full flex min-h-[550px] md:min-h-[400px] overflow-hidden">
        <section
          className="flex justify-center items-center relative w-full duration-500 ease-in-out"
          style={{ transform: "translateX(" + -index * 100 + "%)" }}
        >
          {cardData.map((data, i) => {
            return (
              <div
                className="flex flex-col md:flex-row items-center justify-center w-full gap-[clamp(1rem,6vw,6rem)] absolute z-100"
                style={{ transform: "translateX(" + i * 100 + "%)" }}
              >
                <div className="md:w-auto w-full flex justify-center mb-6 md:mb-0">
                  {ImagePreloader.imagesPreloaded ? (
                    <img
                      src={data.image}
                      alt={data.title}
                      className="w-[300px] aspect-square rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-[300px] aspect-square rounded-xl skeleton"></div>
                  )}
                </div>

                <div className="md:w-1/2 w-full text-left font-albert-sans px-[clamp(1rem,3.5vw,3.5rem)] md:px-0">
                  <h4 className="text-[clamp(1.2rem,4vw,2rem)] md:text-[clamp(1rem,2vw,2rem)] font-semibold mb-2">
                    {data.title}
                  </h4>
                  <p className="text-[clamp(1rem,2.5vw,2rem)] md:text-[clamp(0.8rem,1.5vw,1.2rem)] mb-4 leading-relaxed opacity-75">
                    {data.description}
                  </p>
                  <p className="text-[clamp(1rem,2.5vw,2rem)] md:text-[clamp(0.8rem,1.5vw,1.2rem)] font-light">
                    {data.author}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      </span>

      <button onClick={handleNext} className={btnClass} aria-label="Next">
        <IoIosArrowForward />
      </button>
    </div>
  );
};

export default PeopleCarousel;
