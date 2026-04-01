import useEmblaCarousel from "embla-carousel-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import useImagePreloader from "src/Hooks/useImagepreload";
import { cardData } from "src/Utils/types";

const SlideshowCarousel = ({ images }: { images: cardData[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { imageStates } = useImagePreloader(images.map((d) => d.image));

  return (
    <div className="flex w-full min-h-[clamp(340px,45vw,480px)] items-center gap-[clamp(0.75rem,2vw,1.5rem)] px-[clamp(0.5rem,2vw,1.5rem)]">
      <button className="slide-btn" type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous">
        <IoIosArrowBack size={16} />
      </button>

      <div
        ref={emblaRef}
        className="min-h-[clamp(340px,45vw,480px)] w-full overflow-hidden"
      >
        <div className="flex">
          {images.map((data, i) => (
            <div
              key={i}
              className="flex w-full shrink-0 flex-col items-center gap-[clamp(2rem,5vw,5rem)] px-[clamp(0.5rem,2vw,2rem)] md:flex-row"
            >
              <div className="shrink-0">
                {imageStates[data.image] ? (
                  <div className="relative aspect-square w-[clamp(200px,22vw,300px)] shrink-0 overflow-hidden rounded-2xl border border-(--obs-border) shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                    <div className="obs-slideshow-glint" />
                    <img
                      src={data.image}
                      alt={data.title}
                      className="block size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="obs-skel-sq aspect-square w-[clamp(200px,22vw,300px)] shrink-0 rounded-2xl" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <div className="flex items-center gap-[0.6rem]">
                  <div className="h-0.5 w-5 shrink-0 rounded-sm bg-[#19B5CA]" />
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#19B5CA]">
                    Testimonial
                  </span>
                </div>

                <h4 className="m-0 font-heading text-[clamp(1.3rem,2.2vw,2rem)] font-normal leading-tight text-(--obs-text-primary)">
                  {data.title}
                </h4>

                <div className="obs-divider-fade" />

                <p className="m-0 font-body text-[clamp(0.9rem,1.3vw,1.05rem)] font-light italic leading-[1.85] text-(--obs-text-muted)">
                  {data.description}
                </p>

                <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-(--obs-text-faint)">
                  — {data.author}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="slide-btn" type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Next">
        <IoIosArrowForward size={16} />
      </button>
    </div>
  );
};

export default SlideshowCarousel;
