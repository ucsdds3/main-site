import Section from "./Section";
import { forwardRef } from "react";
import { TeamType } from "../Utils/types";
import Star from "./Star";

const AboutTeam = forwardRef<HTMLDivElement, TeamType>(({ name, image, points }, ref) => {
  if (!name || !image || !points) return null;

  return (
    <Section
      className="w-[80vw] max-w-[1204px] border-2 hover:border-(--color-primary) duration-300 rounded-xl p-[clamp(1.5rem,2vw,2.5rem)] group"
      ref={ref}
    >
      <h2 className="text-[clamp(2rem,2vw,2.5rem)] font-bold uppercase w-full">{`About ${name}`}</h2>

      <div className="w-full flex flex-col lg:flex-row gap-8">
        <div className="aspect-video skeleton flex-[6] rounded-md overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover rounded-md group-hover:scale-105 duration-300"
          />
        </div>

        <div className="flex-[4] flex flex-col justify-center gap-8">
          {points.map((point, index) => (
            <div key={index} className="flex gap-4">
              <Star style={{ width: "30px", height: "30px" }} />
              <div className="flex flex-col gap-2">
                <p className="text-2xl font-bold uppercase">{point.title}</p>
                <p>{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
});

export default AboutTeam;
