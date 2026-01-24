import { memo } from "react";
import { motion } from "framer-motion";

import starImg from "src/Assets/Images/Star.svg";
import { useTheme } from "src/Hooks/useTheme";

interface StarProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Star = memo(function Star({ size = 1, className, style }: StarProps) {
  const { isDark } = useTheme();
  const starVariants = {
    initial: {
      rotate: 0,
      scale: 1,
    },
    animate: {
      rotate: 360,
      scale: [1, 1.1, 0.9, 1],
    },
  };

  return (
    <motion.img
      src={starImg}
      variants={starVariants}
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
});

export default Star;
