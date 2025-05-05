import { useEffect, useRef, useState } from "react";
import { newArray, setIndex } from "../Utils/functions.tsx";

export const useStatCounter = (values: number[]) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [statValues, setStatValues] = useState<number[]>(newArray(values.length, 0));

  useEffect(() => {
    // Update interval and increment speed for smoother and faster animation
    const startCounting = (index: number) => {
      let interval = setInterval(() => {
        setStatValues((prev) =>
          setIndex(prev, index, Math.min(prev[index] + values[index] / 30, values[index])) // Faster counting, divided by 30 for quicker increments
        );
      }, 50); // Shorter interval for smoother transitions, 50ms instead of 100ms

      return interval;
    };

    const refs = itemRefs.current;
    const observers: IntersectionObserver[] = [];
    const intervals: (number | null)[] = newArray(values.length, null);

    refs.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Start counting when the element is in view
            intervals[index] = startCounting(index);
          }
        },
        { threshold: 0.4 } // Trigger when 40% of the element is in view
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      // Clean up the observers and intervals
      observers.forEach((observer, index) => {
        if (refs[index]) {
          observer.unobserve(refs[index]!); // Non-null assertion
        }
      });
      intervals.forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [values]);

  return { statValues, itemRefs };
};
