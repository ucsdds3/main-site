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
        "flex flex-col items-center w-[90vw] lg:w-[80vw] py-[clamp(5rem,6vw,10rem)] gap-10",
        className
      )}
      ref={ref}
      {...props}
    >
      {title && (
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
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