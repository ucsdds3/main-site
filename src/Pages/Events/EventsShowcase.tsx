import Section from "../../Components/Section";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useEffect } from "react";

const EventsShowCase = ({ images }: { images: { title: string; image: string }[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    AutoScroll({ playOnInit: false, speed: 0.5 }),
  ]);
  useEffect(() => {
    const autoScroll = emblaApi?.plugins()?.autoScroll;
    const isPhone = window.matchMedia("(max-width: 768px)");
    if (isPhone.matches) {
      console.log("play");

      autoScroll?.play();
    } else {
      console.log("stop");
      autoScroll?.stop();
    }
  }, [emblaApi]);
  const btnClass =
    "rounded-full hidden md:block w-fit h-fit hover:text-(--color-primary) p-3 hover:bg-base-300 transition-colors duration-300 cursor-pointer text-2xl lg:mx-8";

  const handlePrev = () => {
    emblaApi?.scrollPrev();
  };

  const handleNext = () => {
    emblaApi?.scrollNext();
  };

  return (
    <Section className="gap-8 " title="Notable Workshops">
      <div className="w-[80vw] h-[30vw] flex items-center">
        <button onClick={handlePrev} className={btnClass} aria-label="Previous">
          <IoIosArrowBack />
        </button>
        <section className="w-full flex md:h-full h-fit p-0 overflow-x-hidden" ref={emblaRef}>
          <div className="w-full h-full flex flex-row gap-2 md:px-4 ">
            {images.map((image, i) => {
              return (
                <div className="w-2/3 md:w-full h-full flex-shrink-0">
                  <div
                    key={i}
                    className="flex-shrink-0 border-2 hover:border-(--color-primary) duration-300 rounded-xl flex flex-col w-full h-full items-center justify-center   p-[clamp(0.5rem,2vw,2.5rem)] gap-2"
                  >
                    <h2 className="text-[clamp(1rem,2vw,2.5rem)] min-h-[3rem] font-bold uppercase w-fit text-center">
                      {image.title}
                    </h2>

                    <div className="aspect-video skeleton flex-[6] rounded-2xl overflow-hidden">
                      <img
                        src={image.image}
                        className="w-full h-full object-cover group-hover:scale-105 duration-300"
                      />
                    </div>
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
