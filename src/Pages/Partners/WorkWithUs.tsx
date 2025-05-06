import Button from "../../Components/Button";
import Section from "../../Components/Section";

const WorkWithUs = () => {
  return (
    <Section>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold uppercase">Want to Work With Us?</h3>
        <h2 className="text-[clamp(2.2rem,6vw,4rem)] font-semibold uppercase">DS3 Consulting</h2>
      </div>
      <Button onClick={() => {}}>LEARN MORE</Button>
    </Section>
  );
};

export default WorkWithUs;
