import { twMerge } from "tailwind-merge";
import Section from "./Section";

const Gallery = ({ images }: { images: string[] }) => {
  const sizes = [
    "col-span-4 row-span-5",
    "col-span-3 row-span-3",
    "col-span-3 row-span-3",
    "col-span-3 row-span-3",
    "col-span-3 row-span-7",
    "col-span-4 row-span-5",
    "col-span-3 row-span-4",
  ];

  return (
    <Section title="Gallery">
      <div className="grid grid-cols-10 grid-rows-10 gap-2 h-[100vh]">
        {images.slice(0, sizes.length).map((image, index) => (
          <div className={twMerge("skeleton rounded-sm", sizes[index])} key={index}>
            <img
              src={image}
              className="size-full object-cover rounded-sm"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Gallery;
