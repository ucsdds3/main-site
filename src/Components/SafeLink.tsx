import { twMerge } from "tailwind-merge";

interface SafeLinkProps {
  href: string;
  glow?: boolean;
  title?: string;
  target?: string;
  className?: string;
  children?: React.ReactNode;
}

const SafeLink = ({ href, glow, target, className, children, title }: SafeLinkProps) => {
  return (
    <a
      href={href}
      title={title}
      target={target || "_blank"}
      rel="noopener noreferrer"
      className={twMerge(
        `transition-all duration-300 hover:underline ${
          glow &&
          "hover:text-(--color-primary) hover:[text-shadow:0_0_8px_var(--color-primary),0_0_12px_var(--color-primary)]"
        }`,
        className
      )}
    >
      {children}
    </a>
  );
};

export default SafeLink;
