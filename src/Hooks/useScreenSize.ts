import { useEffect, useState } from "react";

export const useScreenSize = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);

    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    });

    return () => window.removeEventListener("resize", () => {});
  }, []);

  return { width, height };
};