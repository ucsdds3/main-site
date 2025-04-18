import "@fontsource/albert-sans/400.css"; // Import Albert Sans normal weight
import "@fontsource/albert-sans/700.css"; // Import Albert Sans bold weight

import { motion } from "framer-motion";
import BrowserCard from "./BrowserCard";
import cardData from "../../../Assets/Data/browserCards.json";
import Stats from "./Stats";

const GetInvolved = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-20 py-16 w-[90vw] py-[clamp(5rem,5vh,10rem)] lg:w-[80vw]">
      <motion.h2
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        className="font-bold text-[clamp(2.7rem,10vw,4rem)]"
        style={{ fontFamily: "'Albert Sans', sans-serif" }}
      >
        Get Involved
      </motion.h2>

      <Stats />

      <div className="w-full grid grid-cols-[repeat(auto-fit,clamp(350px,80vw,600px))] xl:grid-cols-[repeat(auto-fit,clamp(400px,37vw,700px))] justify-center items-center gap-10 2xl:gap-x-20 mt-10">
        {cardData.map((card, index) => (
          <BrowserCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default GetInvolved;
