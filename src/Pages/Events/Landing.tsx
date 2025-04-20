import workshopImage from "../../Assets/Images/event-landing.png";
import ScrollArrow from "../../Components/ScrollArrow";
import Section from "../../Components/Section";

interface LandingProps {
  title: string;
  subtitle: string;
  nextRef?: React.RefObject<HTMLDivElement>;
}

const Landing = ({ title, subtitle, nextRef }: LandingProps) => {
  return (
    <Section className="md:flex-row justify-center md:justify-between gap-[10vh] md:gap-[5vw] w-[80vw] max-w-[1300px] min-h-[90vh] md:min-h-[95vh]">
      <div className="flex flex-col text-center md:text-left">
        <h2 className="text-[clamp(1.3rem,1.5vw,2rem)] lg:pl-2">
          {subtitle}
        </h2>
        <h1 className="text-[clamp(2.7rem,5vw,5rem)] font-medium leading-tight">
          {title}
        </h1>
      </div>

      <img
        className="w-[clamp(20rem,40%,40rem)]"
        src={workshopImage}
        alt={`Logo Image`}
      />

      {nextRef && <ScrollArrow nextRef={nextRef} />}
    </Section>
  );
};

export default Landing;
