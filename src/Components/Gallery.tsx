import { twMerge } from "tailwind-merge";
import Section from "./Section";
import Button from "./Button";
import useImagePreloader from "../Hooks/useImagepreload";

const Gallery = ({ images, link }: { images: string[], link?: string }) => {
  const sizes = [
    "col-span-4 row-span-5 order-3 md:order-1",
    "col-span-3 row-span-3 order-4 md:order-2",
    "col-span-3 row-span-4 md:row-span-3 order-1 md:order-3",
    "col-span-3 row-span-3 order-5 md:order-4",
    "col-span-4 row-span-4 md:col-span-3 md:row-span-7 order-2 md:order-5",
    "col-span-4 row-span-5 order-6 md:order-6",
    "col-span-3 row-span-4 order-7 md:order-7",
  ];

  const ImagePreloader = useImagePreloader(images);

  return (
    <Section className="gap-0">
      <div className="grid grid-cols-7 grid-rows-13 md:grid-rows-10 md:grid-cols-10 gap-2 max-w-[1200px] h-[clamp(300px,80vh,600px)] mt-10">
        {sizes.map((size, index) => (
          <div className={twMerge("skeleton rounded-sm", size)} key={index}>
            {ImagePreloader.imagesPreloaded && (
              <img
                src={images[index] || "#"}
                className="size-full object-cover rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        ))}
      </div>
      {link && <Button onClick={() => window.open(link, "_blank")} className="mt-8">VIEW ALL</Button>}
    </Section>
  );
};

export default Gallery;
