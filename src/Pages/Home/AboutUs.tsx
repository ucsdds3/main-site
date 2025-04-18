import React from "react";
import whoWeAre from "/src/Assets/Images/who-we-are-img.png";
import whatWeDo from "/src/Assets/Images/green_chair.png";

const AboutUs = ({ aboutUsRef }: { aboutUsRef: React.RefObject<HTMLDivElement> }) => {
  const data = [
    {
      section: "WHO WE ARE",
      title: "We share a passion for data, technology, and problem-solving.",
      content: "We are here to expand the horizons of data science as a community together.",
      button: "OUR TEAM",
      image: whoWeAre,
    },
    {
      section: "WHAT WE DO",
      title: "Build technical skills, network, and gain experience.",
      content: "We are here to expand the horizons of data science as a community together.",
      button: "EVENTS",
      image: whatWeDo,
    },
  ];

  return (
    <div
      className="flex flex-col items-center py-[clamp(5rem,5vh,10rem)] w-[95vw] px-[clamp(1rem,3vw,2rem)] font-albert-sans gap-16"
      ref={aboutUsRef}
    >
      {data.map((section, index) => (
        <div
          className={`flex flex-col gap-6 lg:gap-[7vw] ${index % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
          key={index}
        >
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[clamp(1.2rem,3vw,2rem)] brightness-75">{section.section}</h3>
              <h2 className="text-[clamp(2rem,4vw,4rem)] leading-tight">{section.title}</h2>
              <p className="text-[clamp(1.2rem,1.5vw,2rem)] mt-2 brightness-75">
                {section.content}
              </p>
            </div>
            <button className="btn w-1/2 sm:w-1/3 rounded-full bg-base-300 border-2 border-(--color-primary) py-[clamp(1.5rem,2vw,2.5rem)] text-[clamp(1.2rem,1.2vw,2rem)]">
              {section.button}
            </button>
          </div>

          <div className="flex-1 flex items-center">
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={section.image}
                alt={section.section}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AboutUs;
