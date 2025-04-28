import Countdown from "../../Components/Countdown";
import Section from "../../Components/Section";
import datahacks from "../../Assets/Data/datahacks.json";
import { getNextDeadline } from "../../Utils/functions.tsx";
import Button from "../../Components/Button";

const Landing = () => {
  const deadline = getNextDeadline(datahacks.deadlines);

  return (
    <Section className="h-[90vh] justify-between">
      <div className="flex flex-col text-center lg:text-left px-10">
        <h2 className="text-[clamp(1.5rem,2vw,2rem)] font-medium">What Will You Create?</h2>
        <h1 className="text-[clamp(2.7rem,5vw,5rem)] font-medium leading-tight uppercase text-glow tracking-wider">
          {`DataHacks ${new Date().getFullYear()}`}
        </h1>
        <p className="text-[clamp(1.1rem,1.5vw,1.4rem)]">
          Analyze real-world data, build powerful insights, and create impactful solutions.
        </p>
      </div>

      <Countdown />

      {deadline && deadline[0].toLowerCase().includes("apply") && (
        <Button
          onClick={() => {
            window.open(datahacks.application, "_blank");
          }}
        >
          APPLY NOW
        </Button>
      )}
    </Section>
  );
};

export default Landing;
