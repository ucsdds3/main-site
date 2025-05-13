import { scrollTo } from "../../Utils/functions.tsx";
import consulting from "../../Assets/Data/consulting.json";
import Button from "../../Components/Button";
import Section from "../../Components/Section";
import FlipCard from "./FlipCard";

const Landing = ({ contactRef }: { contactRef: React.RefObject<HTMLDivElement> }) => {
  return (
    <Section className="gap-0 pb-0">
      <h1 className="text-[clamp(32px,5vw,70px)] font-bold">
        <span className="text-[#F58134]">D</span>
        <span className="text-[#19B5CA]">S</span>
        <span className="text-[#A9A9A9]">3</span>
        <span>{" CONSULTING"}</span>
      </h1>
      <p className="text-[clamp(16px,2.5vw,35px)] w-8/10 text-center mb-4">
        Empowering Your Organization Through Applied Data Science.
      </p>
      <Button onClick={() => scrollTo(contactRef)}>CONTACT US</Button>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 w-full mt-10">
        {consulting.services.map((service, index) => (
          <FlipCard key={index} {...service} />
        ))}
      </div>
    </Section>
  );
};

export default Landing;
