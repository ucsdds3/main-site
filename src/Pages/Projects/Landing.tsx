import dino from "/src/Assets/Images/dino.png";
import Section from "../../Components/Section";
import Star from "../../Components/Star";

const Landing = () => {
  return (
    <Section className="lg:flex-row justify-around px-[clamp(0.5rem,1vw,2.5rem)] lg:gap-[clamp(2rem,6vw,10rem)] min-h-[90vh]">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-[clamp(1rem,1vw,3rem)]">
        <h3 className="text-[clamp(1rem,2.5vw,1.5rem)] lg:text-[clamp(1rem,1.7vw,1.5rem)] font-semibold uppercase">
          Want to Build Your Resume?
        </h3>
        <h2 className="text-[clamp(2.2rem,8vw,4rem)] lg:text-[clamp(2.2rem,4vw,4rem)]  font-semibold uppercase">
          Projects
        </h2>
        <p className="text-[clamp(1rem,1.6vw,1.8rem)] font-light max-w-[clamp(20rem,40vw,30rem)]">
          Assisting students with 25+ projects to gain practical data-science experience by working
          on real-world problems, in collaboration with both faculty and industry.
        </p>
        <div className="hidden lg:block relative w-full h-[80px]">
          <Star size={1.4} className="absolute top-3/8 left-1/8" />
          <Star size={2} className="absolute top-5/8 left-1/4" />
        </div>
      </div>

      <div className="w-[clamp(20rem,40vw,30rem)] lg:w-[clamp(18rem,32vw,40rem)] relative">
        <img src={dino} className="px-16 rotate-15" />
        <Star size={2} className="absolute -top-1/4 right-5/8" />
        <Star size={2.5} className="absolute -top-1/8 right-3/8" />
        <Star size={1.5} className="absolute top-3/16 right-5/16" />
        
        <Star size={2} className="absolute top-3/8 left-1/8" />
        <Star size={3} className="absolute top-1/2 left-3/16" />
      </div>
    </Section>
  );
};

export default Landing;
