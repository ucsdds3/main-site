import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Section from "src/Shared/Page/Section";
import { twMerge } from "src/Utils/cn";
import { IoIosArrowDown } from "react-icons/io";

const FAQ = ({ faq }: { faq: Record<string, string> }) => {
  const entries = Object.entries(faq);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section title="FAQ" className="gap-12">
      <div className="flex w-full max-w-[880px] flex-col gap-0">
        {entries.map(([question, answer], index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border-b border-(--obs-border)">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full cursor-pointer items-start justify-between gap-4 border-none bg-transparent py-[1.15rem] text-left"
              >
                <span className="font-heading text-[clamp(1.05rem,2.2vw,1.35rem)] font-normal leading-[1.35] text-(--obs-text-primary)">
                  {question}
                </span>
                <span
                  aria-hidden
                  className={twMerge(
                    "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-(--obs-border) font-mono text-[0.85rem] leading-none text-[#F58134] transition-[transform,border-color] duration-200",
                    isOpen && "rotate-180"
                  )}
                >
                  <IoIosArrowDown />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`faq-a-${index}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="mb-[1.15rem] pr-8 font-body text-[clamp(0.92rem,1.15vw,1.02rem)] font-light leading-[1.75] text-(--obs-text-muted)">
                      {answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default FAQ;
