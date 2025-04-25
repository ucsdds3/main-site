import { twMerge } from "tailwind-merge";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement>;
}

const Section = ({ title, className, children, ref, ...props }: SectionProps) => {
  return (
    <section
      className={twMerge(
        "flex flex-col items-center w-[90vw] lg:w-[80vw] py-[clamp(5rem,6vw,10rem)] gap-10",
        className
      )}
      ref={ref}
      {...props}
    >
      {title && (
        <h2 className="font-semibold text-[clamp(2.7rem,7vw,4rem)] text-center uppercase px-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

export default Section;
