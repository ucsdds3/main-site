import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Section from "src/Shared/Page/Section";
import { IoIosArrowDown } from "react-icons/io";

const FAQ = ({ faq }: { faq: Record<string, string> }) => {
  const entries = Object.entries(faq);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section title="FAQ" className="gap-12">
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {entries.map(([question, answer], index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              style={{
                borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.2))",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "1.15rem 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)",
                    fontWeight: 400,
                    lineHeight: 1.35,
                    color: "var(--obs-text-primary)",
                  }}
                >
                  {question}
                </span>
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    marginTop: 2,
                    borderRadius: "50%",
                    border: "1px solid var(--obs-border, rgba(128,128,128,0.35))",
                    color: "#F58134",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    lineHeight: 1,
                    transition: "transform 0.25s ease, border-color 0.2s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
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
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "clamp(0.92rem, 1.15vw, 1.02rem)",
                        fontWeight: 300,
                        lineHeight: 1.75,
                        color: "var(--obs-text-muted)",
                        margin: "0 0 1.15rem 0",
                        paddingRight: "2rem",
                      }}
                    >
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
