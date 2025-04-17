import { motion } from "framer-motion";
import { useTheme } from "../Store/useTheme";

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
    <div className={`relative inline-block w-fit h-fit mt-4 ${className}`} onClick={onClick}>
      <motion.button
        className={`top-0 border-2 rounded-full py-2 px-6 md:py-3 md:px-8 whitespace-nowrap cursor-pointer md:text-[1.2vw] text-[4vw] min-w-[10vw] md:min-h-[3vw] min-h-[7vw]
          ${
            isDark ? "bg-black text-white border-[#F58134]" : "bg-white text-black border-[#19B5CA]"
          }`}
        variants={buttonVariants}
        initial="initial"
        animate="initial"
        whileHover="hover"
      >
        {contents}
      </motion.button>
      <div
        className={`absolute top-0 translate-y-[1.2vw] md:translate-y-[0.5vw] border-2 w-full h-full rounded-full z-[-1]
          ${isDark ? "bg-[#F58134] border-[#F58134]" : "bg-[#19B5CA] border-[#19B5CA]"}`}
      ></div>
      {/* Invisible element to maintain height */}
      <div className="absolute top-0 invisible py-2 px-6 md:py-3 md:px-8 md:text-[1.2vw] text-[4vw]">
        {contents}
      </div>
    </div>
  );
};

export default Button;
