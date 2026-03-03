import { motion } from "framer-motion";

type ContactUsProps = {
  ref?: React.RefObject<HTMLDivElement>;
  type?: "partners" | "students";
};

const inputStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: "clamp(0.88rem, 1vw, 0.95rem)",
  padding: "0.65rem 0.9rem",
  background: "transparent",
  border: "1px solid var(--obs-border, rgba(128,128,128,0.25))",
  borderRadius: "0.5rem",
  color: "var(--obs-text-primary)",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: "0.6rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "var(--obs-text-primary)",
  opacity: 0.5,
  display: "block",
  marginBottom: "0.4rem",
};

const ContactUs = ({ ref, type = "students" }: ContactUsProps) => {
  const description =
    type === "partners"
      ? "We're always excited to connect with industry partners. Whether you're looking to collaborate on real-world projects, host technical workshops, or support data-driven education, we'd love to hear from you."
      : "DS3 Consulting partners with companies of all sizes to tackle real-world data problems. If your organization needs help with analytics, machine learning, or data strategy, we'd love to explore how we can collaborate.";

  const fields = ["Name", "Email", "Subject"] as const;

  return (
    <div
      id="contact"
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 1300,
        margin: "0 auto",
        padding: "clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 4vw, 3rem)",
      }}
    >
      {/* Section header */}
      <div style={{
        borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.2))",
        marginBottom: "clamp(2rem, 4vw, 4rem)",
        paddingBottom: "clamp(1.5rem, 3vw, 3rem)",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}
        >
          <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
          <span style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}>
            Get in touch
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(3rem, 7vw, 6rem)",
            fontWeight: 400,
            lineHeight: 0.95,
            color: "var(--obs-text-primary)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Contact Us
        </motion.h2>
      </div>

      {/* Two-column: description left, form right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(3rem, 6vw, 7rem)",
          alignItems: "start",
        }}
        className="contact-grid"
      >
        {/* Left: description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.25rem" }}
        >
          <h3 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(1.4rem, 2vw, 1.9rem)",
            fontWeight: 400,
            color: "var(--obs-text-primary)",
            margin: 0,
            lineHeight: 1.2,
          }}>
            Want to learn more?
          </h3>
          <p style={{
            fontSize: "clamp(0.88rem, 1.1vw, 1rem)",
            color: "var(--obs-text-primary)",
            opacity: 0.58,
            margin: 0,
            lineHeight: 1.75,
          }}>
            {description}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.5rem" }}>
            <span style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--obs-text-primary)",
              opacity: 0.4,
            }}>
              Or reach us directly
            </span>
            <a
              href="mailto:ds3@ucsd.edu"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
                color: "#19B5CA",
                textDecoration: "none",
                borderBottom: "1px solid rgba(25,181,202,0.3)",
                paddingBottom: 2,
                width: "fit-content",
              }}
            >
              ds3@ucsd.edu
            </a>
          </div>
        </motion.div>

        {/* Right: form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          target="_blank"
          action="https://formsubmit.co/0e21a47db5d2ad62468688ddd884a595"
          method="POST"
          style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
        >
          {fields.map((label, index) => (
            <div key={index}>
              <label style={labelStyle}>{label}</label>
              <input
                type={label === "Email" ? "email" : "text"}
                name={label}
                required
                placeholder={label === "Email" ? "you@example.com" : label}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "#F58134")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.25))")}
              />
            </div>
          ))}

          <div>
            <label style={labelStyle}>Message</label>
            <textarea
              name="Message"
              required
              placeholder="Tell us what you have in mind..."
              rows={5}
              style={{ ...inputStyle, resize: "vertical", minHeight: "8rem" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#F58134")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--obs-border, rgba(128,128,128,0.25))")}
            />
          </div>

          <button
            type="submit"
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.68rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "0.75rem 1.75rem",
              borderRadius: "2rem",
              border: "1px solid #F58134",
              background: "rgba(245,129,52,0.08)",
              color: "#F58134",
              cursor: "pointer",
              transition: "background 0.2s ease",
              alignSelf: "flex-start",
              marginTop: "0.25rem",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,129,52,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(245,129,52,0.08)")}
          >
            Send Message &rarr;
          </button>
        </motion.form>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;