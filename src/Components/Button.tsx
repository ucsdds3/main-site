import { motion } from "framer-motion";
import { useTheme } from "../Hooks/useTheme";

const buttonVariants = {
  initial: { y: 0 },
  hover: { y: "0.5vw" },
};

interface ButtonProps {
  onClick: () => void;
  contents: string;
  className?: string;
}

const Button = ({ onClick, contents, className = "" }: ButtonProps) => {
  const { isDark } = useTheme();

  return (
    <div className={`relative inline-block w-fit h-fit my-3 ${className}`} onClick={onClick}>
      <motion.button
        className={`border-2 rounded-full py-2 px-6 md:py-3 md:px-8 whitespace-nowrap cursor-pointer text-[clamp(1rem,1.2vw,2rem)] min-w-[clamp(8rem,10vw,15rem)]
          ${isDark ? "bg-black border-[#F58134]" : "bg-white border-[#19B5CA]"}`}
        variants={buttonVariants}
        initial="initial"
        animate="initial"
        whileHover="hover"
      >
        {contents}
      </motion.button>

      <div
        className={`absolute top-0 translate-y-[clamp(0.3rem,1.2vw,0.5rem)] border-2 w-full h-full rounded-full z-[-1]
          ${isDark ? "bg-[#F58134] border-[#F58134]" : "bg-[#19B5CA] border-[#19B5CA]"}`}
      />
    </div>
  );
};

export default Button;
