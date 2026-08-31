import { motion } from "framer-motion";
import { twMerge } from "src/Utils/cn";

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  btnClass?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

/** Primary CTA — matches home hero “Sign Up” (gradient cyan, glow, lift on hover). */
const Button = ({
  onClick,
  children,
  className,
  btnClass,
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={twMerge(
        "relative my-3 inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 px-8 py-3.5 text-center font-mono text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300",
        "bg-gradient-to-br from-[#19B5CA] to-[#0e8fa0]",
        "shadow-[0_0_30px_rgba(25,181,202,0.3)]",
        "hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(25,181,202,0.55)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19B5CA]",
        "disabled:pointer-events-none disabled:opacity-50",
        btnClass,
        className
      )}
    >
      {children}
    </motion.button>
  );
};

export default Button;
