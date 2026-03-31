import { memo } from "react";
import { twMerge } from "tailwind-merge";

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
        "mx-auto flex w-full max-w-[min(92vw,1280px)] flex-col items-center px-4 sm:px-5 md:px-6 lg:max-w-[80vw] lg:px-0 py-[clamp(5rem,6vw,10rem)] gap-10",
        className
      )}
      ref={ref}
      {...props}
    >
      {title && (
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.7rem, 7vw, 4rem)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            textAlign: "center",
            color: "var(--obs-text-primary)",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
});

export default Section;