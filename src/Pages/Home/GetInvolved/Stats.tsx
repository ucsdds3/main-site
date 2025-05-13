import { unbreakable } from "../../../Utils/functions.tsx";
// import { useStatCounter } from "../../../Hooks/useStatCounter";
import { useTheme } from "../../../Hooks/useTheme";
import { useInView } from "framer-motion";
import { useRef } from "react";

const Stats = () => {
  const { isDark } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const stats = [
    { title: "DataHacks Attendees", value: 700, color: "#F58134" },
    { title: "Workshops Hosted", value: 100, color: "#11B3C9" },
    { title: "Active Members", value: 500, color: "#6C6C6C" },
    {
      title: "Projects Completed",
      value: 50,
      color: isDark ? "#FFFFFF" : "#333333",
    },
  ];

  // const { statValues, itemRefs } = useStatCounter(stats.map((stat) => stat.value));
  // Generate custom text shadow based on color
  const getShadowStyle = (color: string) => {
    const toRGBA = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return {
      textShadow: `
        0 5px 15px ${toRGBA(color, 0.4)},
        0 -5px 10px ${toRGBA(color, 0.2)},
        0 0 10px ${toRGBA(color, 0.33)}
      `,
    };
  };
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 w-auto lg:w-full max-w-6xl px-8 md:px-0 border-l-4 md:border-l-0 items-center justify-items-center"
      ref={ref}
    >
      {stats.map((_, index) => (
        <div
          key={index}
          style={{ ...getShadowStyle(stats[index].color) }}
          className={`h-30 w-full flex flex-col items-center px-4 ${
            index > 0 && "lg:border-l-6"
          }`}
          // ref={(el) => {
          //   itemRefs.current[index] = el;
          // }}
        >
          <span
            style={{
              fontFamily: "'Albert Sans', sans-serif",
              color: stats[index].color,
            }}
            className={`text-[clamp(4rem,5vw,5rem)] font-regular md:font-normal ${
              isInView ? `stats-${stats[index].value}` : ""
            }`}
          ></span>

          <span className="text-[clamp(1.5rem,1.7vw,1.5rem)] md:text-center">
            {unbreakable(stats[index].title)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Stats;
