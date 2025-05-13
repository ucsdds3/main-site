import cardData from "../../../Assets/Data/testimonials.json";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import useImagePreloader from "../../../Hooks/useImagepreload";
import useEmblaCarousel from "embla-carousel-react";

const PeopleCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const ImagePreloader = useImagePreloader(
    cardData.map((daton) => daton.image)
  );
  const btnClass =
    "rounded-full hover:text-(--color-primary) p-3 hover:bg-base-300 transition-colors duration-300 cursor-pointer text-2xl md:mx-8 z-100";

  const handlePrev = () => {
    emblaApi?.scrollPrev();
  };

  const handleNext = () => {
    emblaApi?.scrollNext();
  };

  return (
    <div className="w-full min-h-[550px] md:min-h-[400px] flex items-center justify-center gap-4 md:px-4">
      <button onClick={handlePrev} className={btnClass} aria-label="Previous">
        <IoIosArrowBack />
      </button>

      <span
        className="w-full flex min-h-[550px] md:min-h-[400px] overflow-hidden embla"
        ref={emblaRef}
      >
        <section className="flex flex-row w-full ease-in-out embla__container">
          {cardData.map((data, i) => {
            return (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col md:flex-row items-center justify-center w-full gap-[clamp(1rem,6vw,6rem)] z-100 embla__slides"
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
