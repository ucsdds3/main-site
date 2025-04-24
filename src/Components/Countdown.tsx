import { useCountdown } from "../Hooks/useCountdown";
import datahacks from "../Assets/Data/datahacks.json";
import React from "react";

const Countdown = () => {
  const { deadline, time } = useCountdown(datahacks.deadlines);

  return (
    <div className="border-2 border-(--color-primary) rounded-2xl flex flex-col items-center gap-6 w-[clamp(300px,80%,1000px)] my-auto py-6">
      <div className="flex gap-2">
        {Object.entries(time).map(([key, value], index) => (
          <React.Fragment key={index}>
            {index !== 0 && <span className="text-[clamp(2rem,6vw,3rem)]">{" : "}</span>}
            <div className="flex flex-col items-center">
              <span className="text-[clamp(2rem,6vw,3rem)] font-bold">{value}</span>
              <span className="text-[clamp(1rem,3vw,1.5rem)] opacity-75">{key}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <p className="text-[clamp(1rem,3vw,1.5rem)] text-center">
        {deadline ? (
          <>
            {deadline.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="font-bold text-(--color-primary)">
              {deadline.split(" ").slice(-1)}
            </span>
          </>
        ) : (
          <>
            {"DataHacks Has Concluded. See You "}
            <span className="font-bold text-(--color-primary)">Next&nbsp;Year!</span>
          </>
        )}
      </p>
    </div>
  );
};

export default Countdown;
