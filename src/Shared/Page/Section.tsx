import { memo } from "react";
import { twMerge } from "src/Utils/cn";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement>;
}

const Section = memo(function Section({ title, className, children, ref, ...props }: SectionProps) {
  return (
    <section
      className={twMerge(
        "mx-auto flex w-full max-w-[min(92vw,1280px)] flex-col items-center px-4 sm:px-5 md:px-6 lg:max-w-[80vw] lg:px-0 fl-py-20/40 gap-10",
        className
      )}
      ref={ref}
      {...props}
    >
      {title && (
        <h2 className="text-fluid-section-title m-0 text-center leading-[1.05] tracking-tight text-(--obs-text-primary)">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
});

export default Section;