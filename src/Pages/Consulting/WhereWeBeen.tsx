import Section from "../../Components/Section";
import { newArray } from "../../Utils/functions.tsx";

const WhereWeBeen = () => {
  return (
    <Section className="md:flex-row gap-[10vw]">
      <div className="flex-4 flex flex-col items-center justify-center gap-4">
        <h2 className="text-[clamp(2.2rem,8vw,4rem)] md:text-[clamp(2.2rem,4vw,4rem)] font-semibold uppercase">
          Where We've Been
        </h2>
        <p className="text-[clamp(1.2rem,1.5vw,2rem)] opacity-75 font-light md:leading-loose text-center text-wrap px-[clamp(1rem,7vw,7rem)] md:px-0">
          We are here to expand the horizons of data science as a community
          together.
        </p>
      </div>
      <div className="flex-3 min-w-[320px] grid grid-cols-3 grid-rows-3 gap-10 place-items-center md:py-24">
        {newArray(9).map((_, index) => (
          <img src="/main-site/WhereWeBeen/google.png" key={index} className="w-full" />
        ))}
      </div>
    </Section>
  );
};

export default WhereWeBeen;
