import Button from "../../Components/Button";
import Section from "../../Components/Section";
import { hideImage } from "../../Utils/functions.tsx";

const Landing = () => {
  return (
    <Section className="lg:flex-row justify-around px-[clamp(0.5rem,1vw,2.5rem)] gap-[clamp(2rem,6vw,10rem)] min-h-[90vh]">
      <div className="flex flex-col gap-8 items-center lg:items-start text-center lg:text-left px-[clamp(1rem,1vw,3rem)]">
        <div className="flex flex-col">
          <h3 className="text-[clamp(1rem,2.5vw,1.5rem)] lg:text-[clamp(1rem,1.7vw,1.5rem)] font-semibold uppercase">
            Want to Get Involved?
          </h3>
          <h2 className="text-[clamp(2.2rem,8vw,4rem)] lg:text-[clamp(2.2rem,4vw,4rem)]  font-semibold uppercase">
            Join Us
          </h2>
          <p className="text-[clamp(1rem,1.6vw,1.8rem)] font-light max-w-[clamp(15rem,30vw,30rem)]">
            Join DS3 in one click by joining our Discord&nbsp;community!
          </p>
        </div>
        <Button
          onClick={() => {
            window.open("https://discord.gg/K3g6qKkx", "_blank");
          }}
        >
          JOIN OUR DISCORD
        </Button>
      </div>

      <div className="aspect-video w-[clamp(300px,60vw,700px)] lg:w-[clamp(300px,40vw,700px)] rounded-lg overflow-hidden border-2 hover:border-(--color-primary)">
        <img
          className="w-full h-full object-cover hover:scale-105 duration-300"
          src="/main-site/GetInvolved/pf-events-img.webp"
          onError={hideImage}
        />
      </div>
    </Section>
  );
};

export default Landing;
