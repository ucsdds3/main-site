import { motion } from "framer-motion";
import { useTheme } from "../Hooks/useTheme";
import starData from "../Assets/Data/stars.json";
import starImg from "../Assets/Images/Star.svg";

interface StarProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Star = ({ size = 1, className, style }: StarProps) => {
  const { isDark } = useTheme();

  return (
    <motion.img
      src={starImg}
      variants={starData.starVariants}
      initial="initial"
      className={className}
      animate="animate"
      transition={{
        delay: (size ? size : Math.random()) * 0.1,
        duration: 8 + Math.floor(Math.random() * 4),
        repeat: Infinity,
      }}
      style={{
        width: `clamp(1rem,${size}vw,10rem)`,
        opacity: isDark ? 1 : 0.8,
        filter: isDark
          ? "brightness(1) drop-shadow(0px 0px 8px white)"
          : "brightness(0.5) drop-shadow(0px 0px 4px #8888)",
        ...style,
      }}
    />
  );
};

export default Star;
