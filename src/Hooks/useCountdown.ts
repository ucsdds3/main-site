import { useEffect, useState } from "react";
import { getNextDeadline, parseToPST } from "../Utils/functions.tsx";

export const useCountdown = (deadlines: Record<string, string>) => {
  const [time, setTime] = useState({ days: "00", hours: "00", mins: "00", secs: "00" });
  const deadline = getNextDeadline(deadlines);
  const format = (time: number) => String(Math.floor(time)).padStart(2, "0");

  useEffect(() => {
    if (!deadline) return;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = parseToPST(deadline[1]).getTime();
      const timeLeft = targetTime - now;

      if (timeLeft < 0) {
        setTime({ days: "X", hours: "X", mins: "X", secs: "X" });
        return;
      }

      const days = format(timeLeft / (1000 * 60 * 60 * 24));
      const hours = format((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = format((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = format((timeLeft % (1000 * 60)) / 1000);

      setTime({ days, hours, mins: minutes, secs: seconds });
    };

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const isCountdownActive = Object.values(time).some((value) => value !== "X");

  return { deadline: deadline?.[0], time, isCountdownActive };
};
