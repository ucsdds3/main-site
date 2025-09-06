import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

const buttonVariants = {
  initial: { y: 0 },
  hover: { y: "clamp(0.3rem,1.2vw,0.6rem)" },
};

interface ButtonProps {
  onClick: () => void;
  className?: string;
  btnClass?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const Button = ({ onClick, children, className, btnClass, type }: ButtonProps) => {
  return (
    <div className={twMerge("relative size-fit my-3", className)} onClick={onClick}>
      <motion.button
        className={twMerge("border-2 rounded-full py-3 px-10 whitespace-nowrap cursor-pointer text-[clamp(1rem,1.2vw,2rem)] min-w-[clamp(8rem,12vw,15rem)] bg-(--color) border-(--color-primary) uppercase font-semibold", btnClass)}
        variants={buttonVariants}
        initial="initial"
        animate="initial"
        whileHover="hover"
        type={type}
      >
        {children}
      </motion.button>

      <div className="absolute top-0 translate-y-[clamp(0.3rem,1.2vw,0.6rem)] border-2 size-full rounded-full -z-1 bg-(--color-primary) border-(--color-primary)" />
    </div>
  );
};

export default Button;
