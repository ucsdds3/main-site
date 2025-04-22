import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ title, className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={twMerge(
          "flex flex-col items-center w-[90vw] lg:w-[80vw] py-[clamp(5rem,6vw,10rem)] gap-10",
          className
        )}
        {...props}
      >
        {title && (
          <h2 className="font-semibold text-[clamp(2.7rem,7vw,4rem)] text-center uppercase px-4">{title}</h2>
        )}
        {children}
      </section>
    );
  }
);

export default Section;
