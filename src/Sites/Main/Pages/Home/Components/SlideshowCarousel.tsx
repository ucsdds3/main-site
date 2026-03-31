import useEmblaCarousel from "embla-carousel-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import useImagePreloader from "src/Hooks/useImagepreload";
import { cardData } from "src/Utils/types";

const SlideshowCarousel = ({ images }: { images: cardData[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { imageStates } = useImagePreloader(images.map((d) => d.image));

  return (
    <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "clamp(0.75rem, 2vw, 1.5rem)",
          minHeight: "clamp(340px, 45vw, 480px)",
          padding: "0 clamp(0.5rem, 2vw, 1.5rem)",
        }}
      >
        {/* Prev */}
        <button className="slide-btn" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous">
          <IoIosArrowBack size={16} />
        </button>

        {/* Embla viewport */}
        <div
          ref={emblaRef}
          style={{ overflow: "hidden", width: "100%", minHeight: "clamp(340px, 45vw, 480px)" }}
        >
          <div style={{ display: "flex" }}>
            {images.map((data, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "clamp(2rem, 5vw, 5rem)",
                  padding: "0 clamp(0.5rem, 2vw, 2rem)",
                }}
                className="flex-col md:flex-row"
              >
                {/* Image */}
                <div style={{ flexShrink: 0 }}>
                  {imageStates[data.image] ? (
                    <div
                      style={{
                        position: "relative",
                        width: "clamp(200px, 22vw, 300px)",
                        aspectRatio: "1/1",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        border: "1px solid var(--obs-border)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                        flexShrink: 0,
                      }}
                    >
                      {/* glint */}
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,var(--obs-border) 0%,transparent 50%)", zIndex:1, pointerEvents:"none" }} />
                      <img
                        src={data.image}
                        alt={data.title}
                        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="obs-skel-sq"
                      style={{
                        width: "clamp(200px, 22vw, 300px)",
                        aspectRatio: "1/1",
                        borderRadius: "1rem",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, display:"flex", flexDirection:"column", gap:"1rem" }}>
                  {/* Accent line */}
                  <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                    <div style={{ width:20, height:2, background:"#19B5CA", borderRadius:2, flexShrink:0 }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize:"0.62rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#19B5CA" }}>
                      Testimonial
                    </span>
                  </div>

                  <h4
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "clamp(1.3rem, 2.2vw, 2rem)",
                      fontWeight: 400,
                      color: "var(--obs-text-primary)",
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    {data.title}
                  </h4>

                  {/* Divider */}
                  <div style={{ height:1, background:"linear-gradient(90deg,var(--obs-border),transparent)" }} />

                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)",
                      lineHeight: 1.85,
                      color: "var(--obs-text-muted)",
                      fontWeight: 300,
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    {data.description}
                  </p>

                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      color: "var(--obs-text-faint)",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    — {data.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next */}
        <button className="slide-btn" onClick={() => emblaApi?.scrollNext()} aria-label="Next">
          <IoIosArrowForward size={16} />
        </button>
    </div>
  );
};

export default SlideshowCarousel;