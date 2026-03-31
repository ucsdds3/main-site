import { motion } from "framer-motion";

type ContactUsProps = {
  ref?: React.RefObject<HTMLDivElement | null>;
  type?: "partners" | "students";
};

const ContactUs = ({ ref, type = "students" }: ContactUsProps) => {
  const description =
    type === "partners"
      ? "We're always excited to connect with industry partners. Whether you're looking to collaborate on real-world projects, host technical workshops, or support data-driven education, we'd love to hear from you."
      : "DS3 Consulting partners with companies of all sizes to tackle real-world data problems. If your organization needs help with analytics, machine learning, or data strategy, we'd love to explore how we can collaborate.";

  const fields = ["Name", "Email", "Subject"] as const;

  const fieldClass =
    "w-full rounded-lg border border-[var(--obs-border,rgba(128,128,128,0.25))] bg-transparent px-[0.9rem] py-[0.65rem] text-[clamp(0.88rem,1vw,0.95rem)] text-[var(--obs-text-primary)] outline-none transition-colors focus:border-[#F58134]";

  const labelClass =
    "mb-1.5 block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.18em] text-[var(--obs-text-primary)] opacity-50";

  return (
    <div id="contact" ref={ref} className="mx-auto w-full max-w-[1300px] px-5 py-12 md:px-12 md:py-20">
      <div className="mb-8 border-b border-[var(--obs-border,rgba(128,128,128,0.2))] pb-8 md:mb-16 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex items-center gap-2.5"
        >
          <div className="h-0.5 w-[22px] shrink-0 rounded-sm bg-[#F58134]" />
          <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.22em] text-[#F58134]">
            Get in touch
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="m-0 font-[family-name:var(--font-heading)] text-[clamp(3rem,7vw,6rem)] font-normal leading-[0.95] tracking-[-0.02em] text-[var(--obs-text-primary)]"
        >
          Contact Us
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-[clamp(3rem,6vw,7rem)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6 pt-0.5"
        >
          <h3 className="m-0 font-[family-name:var(--font-heading)] text-[clamp(1.4rem,2vw,1.9rem)] font-normal leading-tight text-[var(--obs-text-primary)]">
            Want to learn more?
          </h3>
          <p className="m-0 text-[clamp(0.88rem,1.1vw,1rem)] leading-[1.75] text-[var(--obs-text-primary)] opacity-[0.58]">
            {description}
          </p>

          <div className="mt-2 flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.18em] text-[var(--obs-text-primary)] opacity-40">
              Or reach us directly
            </span>
            <a
              href="mailto:ds3@ucsd.edu"
              className="w-fit border-b border-[rgba(25,181,202,0.3)] pb-0.5 font-[family-name:var(--font-heading)] text-[clamp(1rem,1.4vw,1.25rem)] text-[#19B5CA] no-underline"
            >
              ds3@ucsd.edu
            </a>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          target="_blank"
          action="https://formsubmit.co/0e21a47db5d2ad62468688ddd884a595"
          method="POST"
          className="flex flex-col gap-[1.1rem]"
        >
          {fields.map((label, index) => (
            <div key={index}>
              <label className={labelClass}>{label}</label>
              <input
                type={label === "Email" ? "email" : "text"}
                name={label}
                required
                placeholder={label === "Email" ? "you@example.com" : label}
                className={fieldClass}
              />
            </div>
          ))}

          <div>
            <label className={labelClass}>Message</label>
            <textarea
              name="Message"
              required
              placeholder="Tell us what you have in mind..."
              rows={5}
              className={`${fieldClass} min-h-32 resize-y`}
            />
          </div>

          <button
            type="submit"
            className="mt-1 self-start rounded-full border border-[#F58134] bg-[rgba(245,129,52,0.08)] px-7 py-3 font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.2em] text-[#F58134] transition-colors hover:bg-[rgba(245,129,52,0.2)]"
          >
            Send Message →
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default ContactUs;
