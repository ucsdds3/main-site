import { motion } from "framer-motion";

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
  return (
    <div className="mx-auto w-full max-w-[1300px] px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2.5rem,5vw,5rem)]">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-[clamp(2.5rem,4vw,4rem)]"
      >
        <div className="mb-[0.85rem] flex items-center gap-[0.6rem]">
          <div className="obs-accent-bar-orange" />
          <span className="text-eyebrow text-eyebrow-orange">Partnerships</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="m-0 font-heading text-[clamp(2rem,4vw,3.5rem)] font-normal leading-none tracking-tight text-(--obs-text-primary)">
            Work With Us
          </h2>
          <a
            href="https://drive.google.com/drive/folders/1SsWNyer200v3aojhCbK2VQhe33dcAXy6?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block shrink-0 cursor-pointer rounded-[2rem] border border-[#F58134] bg-[rgba(245,129,52,0.08)] px-[1.4rem] py-[0.6rem] font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#F58134] no-underline transition-colors duration-200 hover:bg-[rgba(245,129,52,0.18)]"
          >
            View Sponsor Packet →
          </a>
        </div>
      </motion.div>

      {/* Tier columns */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(260px,28vw,360px),1fr))] items-start gap-[clamp(1.25rem,2.5vw,2rem)]">
        {TIERS.map((tier, ti) => (
          <motion.div
            key={ti}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: ti * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-[0.875rem] border border-(--obs-border)"
          >
            {/* Tier header */}
            <div className="border-b border-(--obs-border) bg-[rgba(128,128,128,0.04)] p-[clamp(1.25rem,2vw,1.75rem)]">
              <span
                className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.2em]"
                style={{ color: tier.color }}
              >
                {tier.label}
              </span>
              <h3 className="m-0 font-heading text-[clamp(1.1rem,1.6vw,1.45rem)] font-normal leading-tight text-(--obs-text-primary)">
                {tier.heading}
              </h3>
            </div>

            {/* Offerings */}
            <div className="flex flex-col p-[clamp(1rem,1.5vw,1.5rem)]">
              {tier.offerings.map((item, oi) => (
                <div key={oi}>
                  {oi > 0 && (
                    <div className="my-[clamp(0.85rem,1.2vw,1.1rem)] h-px bg-(--obs-border)" />
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-[0.45rem] size-1.5 shrink-0 rounded-full opacity-70"
                      style={{ background: tier.color }}
                    />
                    <div>
                      <p className="mb-1 font-heading text-[clamp(0.95rem,1.3vw,1.1rem)] font-normal leading-snug text-(--obs-text-primary)">
                        {item.title}
                      </p>
                      <p className="m-0 text-[clamp(0.78rem,0.95vw,0.88rem)] leading-[1.65] text-(--obs-text-primary) opacity-[0.55]">
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
