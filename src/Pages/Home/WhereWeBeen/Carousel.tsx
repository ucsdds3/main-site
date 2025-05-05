import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useTheme } from "../../../Hooks/useTheme";
import companies from "../../../Assets/Data/companyLogos.json";

export default function Carousel() {
  const { isDark } = useTheme();
  const companyLogos = isDark ? companies.dark : companies.light;

  // Set up Embla with autoScroll plugin:
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    AutoScroll({
      playOnInit: true,
      speed: 1,
      stopOnInteraction: false,
      stopOnFocusIn: false,
    }),
  ]);

  return (
    <div className="embla overflow-hidden w-full md:w-[80%] mt-5" ref={emblaRef}>
      <div className="embla__container flex gap-6 mx-6">
        {companyLogos.map((logoSrc, index) => (
          <div
            className="embla__slide max-w-[clamp(200px,15vw,500px)] h-[clamp(100px,5vw,200px)] flex-shrink-0 p-4 flex justify-center items-center"
            key={index}
          >
            <img src={logoSrc} alt="logo" className="object-contain w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
