import Section from "../../Components/Section";
import datahacks from "../../Assets/Data/datahacks.json";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import About from "../../Components/About";
import SafeLink from "../../Components/SafeLink";
import Button from "../../Components/Button";
import useEmblaCarousel from "embla-carousel-react";
import { datahacksWinner } from "../../Utils/types";
import { newArray } from "../../Utils/functions";
import { useState } from "react";

const ShowCase = () => {
  const winners = datahacks.winners;
  const [index, setIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const btnClass =
    "rounded-full w-fit h-fit hover:text-(--color-primary) p-3 hover:bg-base-300 transition-colors duration-300 cursor-pointer text-2xl lg:mx-8";

  const getPoints = (winner: datahacksWinner) => {
    return {
      Members: winner.members.join(", "),
      Description: winner.description,
      Links: (
        <>
          <SafeLink href={winner.devpost} glow>
            Devpost
          </SafeLink>
          {winner.github && " | "}
          {winner.github && (
            <SafeLink href={winner.github} glow>
              GitHub
            </SafeLink>
          )}
        </>
      )
    };
  };

  const handlePrev = () => {
    setIndex((prev) => (prev == 0 ? winners.length - 1 : prev - 1));
    emblaApi?.scrollPrev();
  };

  const handleNext = () => {
    setIndex((prev) => (prev == winners.length - 1 ? 0 : prev + 1));
    emblaApi?.scrollNext();
  };
  const onDotButtonClick = (i: number) => {
    setIndex(i);
    emblaApi?.scrollTo(i);
  };

  return (
    <Section title="Past Winners" className="gap-0 w-full">
      <span className="w-full h-fit flex flex-col items-center">
        <div className="w-full flex items-center">
          <button onClick={handlePrev} className={btnClass} aria-label="Previous">
            <IoIosArrowBack />
          </button>
          <section className="w-full flex h-fit p-0 overflow-x-hidden" ref={emblaRef}>
            <div className="w-full flex flex-row gap-2 md:px-4 ">
              {winners.map((winner, i) => {
                return (
                  <div className="flex-shrink-0 flex w-full h-full">
                    <About
                      key={i}
                      noAbout
                      name={`${winner.category}: ${winner.title}`}
                      image={winner.image}
                      points={getPoints(winner)}
                      className="w-full h-full"
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
        <div className="flex gap-3">
          {newArray(winners.length).map((_, i) => (
            <div
              key={i}
              onClick={() => onDotButtonClick(i)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                index == i ? "bg-(--color-primary)" : "bg-(--color-primary)/50"
              }`}
            />
          ))}
        </div>
        <Button
          className={"mt-10"}
          onClick={() => window.open("https://datahacks-25.devpost.com/", "_blank")}
        >
          DEVPOST
        </Button>
      </span>
    </Section>
  );
};

export default ShowCase;
