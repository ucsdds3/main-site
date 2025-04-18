import { useEffect, useRef, useState } from "react";
import { newArray, setIndex } from "../Utils/functions";

export const useStatCounter = (values: number[]) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [statValues, setStatValues] = useState<number[]>(newArray(values.length, 0));
  const [animated, setAnimated] = useState<boolean[]>(newArray(values.length, false));

  useEffect(() => {
    const startCounting = (index: number) => {
      return setInterval(() => {
        setStatValues((prev) =>
          setIndex(prev, index, Math.min(prev[index] + values[index] / 15, values[index]))
        );
      }, 100);
    };

    const refs = itemRefs.current;
    const data = refs.map((ref, index) => {
      if (!ref) return { observer: null, interval: null };

      let interval;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || animated[index]) return;
          setAnimated((prev) => setIndex(prev, index, true));
          interval = startCounting(index);
        },
        { threshold: 0.4 }
      );

      observer.observe(ref);
      return { observer, interval };
    });

    return () => {
      data.forEach(({ observer, interval }, index) => {
        if (observer && refs[index]) observer.unobserve(refs[index]);
        if (interval) clearInterval(interval);
      });
    };
  }, [animated, itemRefs, setAnimated, values]);

  return { statValues, animated, itemRefs };
};
