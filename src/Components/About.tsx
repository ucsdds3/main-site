import Section from "./Section";
import { TeamType } from "../Utils/types";
import Star from "./Star";
import { hideImage } from "../Utils/functions.tsx";
import { twMerge } from "tailwind-merge";

interface AboutProps extends TeamType {
  noAbout?: boolean;
  className?: string;
}

const About = ({ name, image, points, noAbout, className }: AboutProps) => {
  if (!name || !image || !points) return null;

  return (
    <Section className="pt-[12rem]">
      <div
        className={twMerge(
          "w-[80vw] max-w-[1204px] border-2 hover:border-(--color-primary) duration-300 rounded-xl p-[clamp(1.5rem,2vw,2.5rem)] group",
          className
        )}
      >
        <h2 className="text-[clamp(1.5rem,2vw,2.5rem)] font-bold uppercase w-full">
          {noAbout ? name : `About ${name}`}
        </h2>

        <div className="w-full flex flex-col lg:flex-row gap-8 mt-6">
          <div className="aspect-video skeleton flex-[6] rounded-2xl overflow-hidden">
            <img
              src={image}
              className="w-full h-full object-cover group-hover:scale-105 duration-300"
              onError={hideImage}
            />
          </div>

          <div className="flex-[4] flex flex-col justify-center gap-8">
            {Object.entries(points).map(([point, description], index) => (
              <div key={index} className="flex gap-4">
                <Star className="mt-1" style={{ width: "30px", height: "30px" }} />
                <div className="flex flex-col gap-2">
                  <p className="text-[clamp(1rem,2.5vw,1.4rem)] font-bold uppercase">{point}</p>
                  <p className="text-[clamp(0.8rem,2.2vw,1.2rem)] opacity-75 line-clamp-6">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default About;
