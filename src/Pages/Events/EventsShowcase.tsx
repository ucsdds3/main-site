import Section from "../../Components/Section";
import datahacks from "../../Assets/Data/datahacks.json";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import About from "../../Components/About";
import useEmblaCarousel from "embla-carousel-react";

const EventsShowCase = () => {
  const winners = datahacks.winners;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const btnClass =
    "rounded-full w-fit h-fit hover:text-(--color-primary) p-3 hover:bg-base-300 transition-colors duration-300 cursor-pointer text-2xl lg:mx-8";

  const handlePrev = () => {
    emblaApi?.scrollPrev();
  };

  const handleNext = () => {
    emblaApi?.scrollNext();
  };

  return (
    <Section className="gap-0 w-full">
      <div className="w-full  flex items-center">
        <button onClick={handlePrev} className={btnClass} aria-label="Previous">
          <IoIosArrowBack />
        </button>
        <section className="w-full flex h-fit p-0 overflow-x-hidden" ref={emblaRef}>
          <div className="w-full h-fit flex flex-row gap-2 md:px-4 ">
            {winners.map((winner, i) => {
              return (
                <div className="flex-shrink-0 flex w-full h-fit p-0">
                  <About
                    key={i}
                    noAbout
                    name={`${winner.category}: ${winner.title}`}
                    image={winner.image}
                    className="w-full h-fit"
                  />
                </div>
              );
            })}
          </div>
        </section>
        <button onClick={handleNext} className={btnClass} aria-label="Next">
          <IoIosArrowForward />
        </button>
      </div>
    </Section>
  );
};

export default EventsShowCase;
