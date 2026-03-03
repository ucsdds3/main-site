import { motion } from "framer-motion";
import consultingData from "../Data/consulting.json";

const Services = () => {
  const services = consultingData.services;
  return (
    <div style={{ width: "100%" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
          <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#F58134" }}>What we offer</span>
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 400, color: "var(--obs-text-primary)", margin: 0, lineHeight: 1.1 }}>Our Services</h2>
      </motion.div>
      <style>{".flip-card{perspective:1000px;height:clamp(180px,22vw,240px)}.flip-card-inner{position:relative;width:100%;height:100%;transition:transform 0.55s cubic-bezier(0.22,1,0.36,1);transform-style:preserve-3d}.flip-card:hover .flip-card-inner{transform:rotateY(180deg)}.flip-card-front,.flip-card-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:.75rem;border:1px solid var(--obs-border,rgba(128,128,128,0.18));display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(1.25rem,2vw,1.75rem);gap:.85rem}.flip-card-front{background:transparent;transition:border-color 0.25s ease}.flip-card:hover .flip-card-front{border-color:#F58134}.flip-card-back{background:rgba(245,129,52,0.07);border-color:rgba(245,129,52,0.35);transform:rotateY(180deg);text-align:center}"}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 200px))", gap: "clamp(0.75rem, 1.5vw, 1.25rem)", justifyContent: "center" }}>
        {services.map((service, index) => (
          <motion.div key={index} className="flip-card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={service.icon} alt={service.title} style={{ width: "clamp(64px, 8vw, 96px)", height: "clamp(64px, 8vw, 96px)", objectFit: "contain" }} />
                <p style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)", fontWeight: 400, color: "var(--obs-text-primary)", margin: 0, textAlign: "center", lineHeight: 1.3 }}>{service.title}</p>
              </div>
              <div className="flip-card-back">
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#F58134" }}>{service.title}</span>
                <p style={{ fontSize: "clamp(0.78rem, 0.95vw, 0.88rem)", color: "var(--obs-text-primary)", opacity: 0.75, margin: 0, lineHeight: 1.65 }}>{service.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Services;