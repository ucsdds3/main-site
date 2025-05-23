import BrowserCard from "../../../Components/BrowserCard";
import cardData from "../../../Assets/Data/getInvolved.json";
import Section from "../../../Components/Section";
import Stats from "./Stats";

const GetInvolved = () => {
  return (
    <Section title="Get Involved" className="gap-20">
      <Stats />

      <div className="w-full grid grid-cols-[repeat(auto-fit,clamp(300px,80vw,600px))] xl:grid-cols-[repeat(auto-fit,clamp(400px,37vw,700px))] justify-center items-center gap-10 2xl:gap-x-20 mt-10">
        {cardData.map((card, index) => (
          <BrowserCard
            key={index}
            {...card}
            delay={index * 0.12} // delay based on the index
          />
        ))}
      </div>
    </Section>
  );
};

export default GetInvolved;
