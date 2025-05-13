import Section from "../../Components/Section";

const AboutUs = () => {
  return (
    <Section id="about-us" className="flex-col-reverse md:flex-row md:gap-[10vw] min-h-[80vh] pt-[clamp(10rem,12vw,20rem)] pb-0">
      <div className="flex-3 relative top-0 left-0 size-full min-h-[500px]">
        <img
          src="/main-site/Consulting/Layer3.png"
          alt="Layer 3"
          className="absolute w-full max-w-[350px] z-3 top-[35%] left-1/2 -translate-1/2"
        />
        <img
          src="/main-site/Consulting/Layer2.png"
          alt="Layer 2"
          className="absolute w-full max-w-[350px] z-2 top-[50%] left-1/2 -translate-1/2"
        />
        <img
          src="/main-site/Consulting/Layer1.png"
          alt="Layer 1"
          className="absolute w-full max-w-[350px] z-1 top-[65%] left-1/2 -translate-1/2"
        />
      </div>

      <div className="flex-4 flex flex-col justify-center items-center h-full gap-5">
        <h2 className="text-[clamp(2.2rem,8vw,4rem)] md:text-[clamp(2.2rem,4vw,4rem)] font-semibold uppercase">
          About Us
        </h2>
        <p className="text-[clamp(1.2rem,1.5vw,2rem)] opacity-75 indent-8 font-light md:leading-loose text-justify text-wrap px-[clamp(1rem,7vw,7rem)] md:px-0">
        DS3 Consulting is a student-run team of data scientists and engineers offering end-to-end solutions in analytics, machine learning, MLOps, and architecture. We collaborate with organizations of all sizes to deliver custom insights, models, and scalable data products that drive impact. While we proudly offer pro bono support to local small businesses and nonprofits, we also welcome paid partnerships and contract work with startups, research teams, and enterprise clients seeking reliable, high-quality technical solutions.
        </p>
      </div>
    </Section>
  );
};

export default AboutUs;
