import { twMerge } from "tailwind-merge";
import { AnchorHTMLAttributes } from "react";

interface SafeLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  glow?: boolean;
}

const SafeLink = ({ href, glow, className, children, ...props }: SafeLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={twMerge(
        `hover:underline ${
          glow &&
          "hover:text-(--color-primary) hover:[text-shadow:0_0_3px_var(--color-primary),0_0_12px_var(--color-primary)] transition duration-300"
        }`,
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export default SafeLink;
