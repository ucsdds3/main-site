import Section from "../../Components/Section";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import useEmblaCarousel from "embla-carousel-react";

const EventsShowCase = ({ images }: { images: { title: string; image: string }[] }) => {
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
    <Section className="gap-0 ">
      <div className="w-[80vw] h-[30vw] flex items-center">
        <button onClick={handlePrev} className={btnClass} aria-label="Previous">
          <IoIosArrowBack />
        </button>
        <section className="w-full flex h-full p-0 overflow-x-hidden" ref={emblaRef}>
          <div className="w-full h-full flex flex-row gap-2 md:px-4 ">
            {images.map((image, i) => {
              return (
                <div className="w-full h-full flex-shrink-0">
                  <div
                    key={i}
                    className="flex-shrink-0 border-2 hover:border-(--color-primary) duration-300 rounded-xl flex flex-col w-full h-full items-center justify-center  p-[clamp(1.5rem,2vw,2.5rem)]"
                  >
                    <h1>{image.title}</h1>
                    <img src={image.image} alt="" className="h-full object-cover" />
                  </div>
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
