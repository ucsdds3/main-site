import Section from "../../Components/Section";
import datahacks from "../../Assets/Data/datahacks.json";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useState } from "react";
import About from "../../Components/About";
import SafeLink from "../../Components/SafeLink";
import Button from "../../Components/Button";
import { newArray } from "../../Utils/functions";

const ShowCase = () => {
  const [index, setIndex] = useState(0);
  const winners = datahacks.winners;
  const { title, description, members, image, category, devpost, github } = winners[index];

  const btnClass =
    "rounded-full hover:text-(--color-primary) p-3 hover:bg-base-300 transition-colors duration-300 cursor-pointer text-2xl lg:mx-8";

  const points: Record<string, React.ReactNode> = {
    Members: members.join(", "),
    Description: description,
    Links: (
      <>
        <SafeLink href={devpost} glow>
          Devpost
        </SafeLink>
        {github && " | "}
        {github && (
          <SafeLink href={github} glow>
            GitHub
          </SafeLink>
        )}
      </>
    ),
  };

  const handlePrev = () => {
    setIndex((prev) => (prev == 0 ? winners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev == winners.length - 1 ? 0 : prev + 1));
  };

  return (
    <Section title="Past Winners" className="gap-0">
      <Button onClick={() => window.open("https://datahacks-25.devpost.com/", "_blank")}>
        DEVPOST
      </Button>

      <div className="w-full flex items-center justify-center gap-[clamp(0.5rem,1vw,1rem)] md:px-4">
        <button onClick={handlePrev} className={btnClass} aria-label="Previous">
          <IoIosArrowBack />
        </button>

        <About
          noAbout
          name={`${category}: ${title}`}
          image={image}
          points={points}
          className="w-[70vw] md:w-[80vw]"
        />

        <button onClick={handleNext} className={btnClass} aria-label="Next">
          <IoIosArrowForward />
        </button>
      </div>

      <div className="flex gap-3 -mt-[clamp(3rem,4vw,8rem)]">
        {newArray(winners.length).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              index == i ? "bg-(--color-primary)" : "bg-(--color-primary)/50"
            }`}
          />
        ))}
      </div>
    </Section>
  );
};

export default ShowCase;
