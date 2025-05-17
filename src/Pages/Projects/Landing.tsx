import dino from "/src/Assets/Images/projects_dino.webp";
import Section from "../../Components/Section";
import Star from "../../Components/Star";

const Landing = () => {
  return (
    <Section className="lg:flex-row justify-around px-[clamp(0.5rem,1vw,2.5rem)] lg:gap-[clamp(2rem,6vw,10rem)] min-h-[90vh]">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-[clamp(1rem,1vw,3rem)]">
        <h3 className="text-[clamp(1rem,2.5vw,1.5rem)] lg:text-[clamp(1rem,1.7vw,1.5rem)] font-semibold uppercase">
          Want to Build Your Resume?
        </h3>
        <h2 className="text-[clamp(3rem,10vw,6rem)] lg:text-[clamp(3rem,6vw,5rem)]  font-semibold uppercase">
          Projects
        </h2>
        <div className="hidden lg:block relative w-full h-[80px]">
          <Star size={1.4} className="absolute top-3/8 left-1/8" />
          <Star size={2} className="absolute top-5/8 left-1/4" />
        </div>
      </div>

      <div className="w-[clamp(20rem,40vw,30rem)] lg:w-[clamp(18rem,32vw,40rem)] relative">
        <img src={dino} className="px-16 rotate-15" />
        <Star size={2} className="absolute top-1 right-5/8" />
        <Star size={2.5} className="absolute -top-1/12 right-3/8" />
        <Star size={1.5} className="absolute top-3/16 right-5/24" />
        
        <Star size={2} className="absolute top-2/8 left-2/8" />
      </div>
    </Section>
  );
};

export default Landing;
