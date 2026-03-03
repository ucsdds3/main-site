import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const TIERS = [
  {
    label: "Industry & Companies",
    heading: "Work with top tech talent.",
    color: "#F58134",
    offerings: [
      {
        title: "Talent Pipeline",
        description:
          "Get direct access to our highly skilled member pool for internships, new grad roles, and project-based contracts.",
      },
      {
        title: "Company Workshops",
        description:
          "Host a technical workshop with our members — from tool demos to full hands-on sessions. A great way to build brand presence on campus.",
      },
      {
        title: "Sponsorship",
        description:
          "Help fund DS3's projects, events, and club operations. Sponsors receive prominent branding across our materials and events.",
      },
      {
        title: "Mentors, Judges & Panels",
        description:
          "Bring your team to DataHacks as judges, speak on industry panels, or mentor student project teams through our quarterly program.",
      },
      {
        title: "Consulting",
        description:
          "Our consulting committee works directly with companies on scoped data science engagements — from EDA to model development.",
      },
    ],
  },
  {
    label: "Departments, Research, & Non-Profits",
    heading: "Bridging research and talent.",
    color: "#11B3C9",
    offerings: [
      {
        title: "Department Involvement",
        description:
          "Partner with DS3 to engage your students through events, workshops, and initiatives that complement your curriculum.",
      },
      {
        title: "Research Consulting",
        description:
          "Our consulting program is built specifically for research groups sitting on datasets they haven't fully leveraged — we help extract meaningful insight and build data pipelines.",
      },
      {
        title: "Talent Pipeline",
        description:
          "Get access to our highly skilled member pool for research positions and project-based contracts.",
      },
      {
        title: "Website Development",
        description:
          "Our software team can build custom websites for research groups, labs, and non-profits to showcase their work and impact.",
      },
    ],
  },
  {
    label: "Student Organizations & Clubs",
    heading: "Let's Build something together.",
    color: "#F58134",
    offerings: [
      {
        title: "Co-hosted Workshops & Events",
        description:
          "Collaborate on smaller workshops or larger joint events. We're always open to cross-club initiatives that serve both communities.",
      },
      {
        title: "DataHacks Co-organization",
        description:
          "Join us in running DataHacks — UCSD's premier data science hackathon. Co-organizing clubs share in planning, logistics, and exposure.",
      },
      {
        title: "Quarterly Project Collaboration",
        description:
          "Partner on our quarterly student projects. Reach out by Week 7 of the quarter prior to the one you'd like to collaborate in.",
      },
    ],
  },
];

const WorkWithUs = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1300,
        margin: "0 auto",
        padding: "clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 4vw, 3rem)",
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "clamp(2.5rem, 4vw, 4rem)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
          <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
          <span style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#F58134",
          }}>
            Partnerships
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 400,
            color: "var(--obs-text-primary)",
            margin: 0,
            lineHeight: 1.0,
            letterSpacing: "-0.01em",
          }}>
            Work With Us
          </h2>
          <button
            onClick={() => {
              const el = document.getElementById("contact");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0.6rem 1.4rem",
              borderRadius: "2rem",
              border: "1px solid #F58134",
              background: "rgba(245,129,52,0.08)",
              color: "#F58134",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,129,52,0.18)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(245,129,52,0.08)")}
          >
            Get in touch →
          </button>
        </div>
      </motion.div>

      {/* Tier columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(clamp(260px, 28vw, 360px), 1fr))",
        gap: "clamp(1.25rem, 2.5vw, 2rem)",
        alignItems: "start",
      }}>
        {TIERS.map((tier, ti) => (
          <motion.div
            key={ti}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: ti * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              border: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
              borderRadius: "0.875rem",
              overflow: "hidden",
            }}
          >
            {/* Tier header */}
            <div style={{
              padding: "clamp(1.25rem, 2vw, 1.75rem)",
              borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.12))",
              background: "rgba(128,128,128,0.04)",
            }}>
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: tier.color,
                display: "block",
                marginBottom: "0.5rem",
              }}>
                {tier.label}
              </span>
              <h3 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(1.1rem, 1.6vw, 1.45rem)",
                fontWeight: 400,
                color: "var(--obs-text-primary)",
                margin: 0,
                lineHeight: 1.2,
              }}>
                {tier.heading}
              </h3>
            </div>

            {/* Offerings */}
            <div style={{ padding: "clamp(1rem, 1.5vw, 1.5rem)", display: "flex", flexDirection: "column" }}>
              {tier.offerings.map((item, oi) => (
                <div key={oi}>
                  {oi > 0 && (
                    <div style={{
                      height: 1,
                      background: "var(--obs-border, rgba(128,128,128,0.1))",
                      margin: "clamp(0.85rem, 1.2vw, 1.1rem) 0",
                    }} />
                  )}
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: tier.color,
                      flexShrink: 0,
                      marginTop: "0.45rem",
                      opacity: 0.7,
                    }} />
                    <div>
                      <p style={{
                        fontFamily: "'DM Serif Display', Georgia, serif",
                        fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
                        fontWeight: 400,
                        color: "var(--obs-text-primary)",
                        margin: "0 0 0.25rem 0",
                        lineHeight: 1.25,
                      }}>
                        {item.title}
                      </p>
                      <p style={{
                        fontSize: "clamp(0.78rem, 0.95vw, 0.88rem)",
                        color: "var(--obs-text-primary)",
                        opacity: 0.55,
                        margin: 0,
                        lineHeight: 1.65,
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkWithUs;