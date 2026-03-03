import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

import { useTheme } from "src/Hooks/useTheme";
import companies from "../Data/companyLogos.json";

export default function Carousel() {
  const { isDark } = useTheme();
  const companyLogos = isDark ? companies.dark : companies.light;

  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    AutoScroll({
      playOnInit: true,
      speed: 1,
      stopOnInteraction: false,
      stopOnFocusIn: false,
    }),
  ]);

  const fadeColor = isDark ? "#0b1220" : "#f2ede6";

  return (
    <div className="relative w-full flex justify-center">
      {/* Left fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
        style={{ background: `linear-gradient(90deg, ${fadeColor}, transparent)` }}
      />
      {/* Right fade */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
        style={{ background: `linear-gradient(270deg, ${fadeColor}, transparent)` }}
      />

      <div className="embla overflow-hidden w-full mt-5" ref={emblaRef}>
        <div className="embla__container flex gap-6 mx-6">
          {companyLogos.map((logoSrc, index) => (
            <div
              className="embla__slide min-w-[clamp(120px,18vw,220px)] h-[clamp(60px,5vw,200px)] flex-shrink-0 p-4 flex justify-center items-center"
              key={index}
            >
              <img src={logoSrc} alt="logo" className="object-contain w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}