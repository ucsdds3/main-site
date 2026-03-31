import { motion } from "framer-motion";
import consultingData from "../Data/consulting.json";

const Services = () => {
  const services = consultingData.services;
  return (
    <div style={{ width: "100%" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
          <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#F58134" }}>What we offer</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 3.4vw, 3.1rem)", fontWeight: 400, color: "var(--obs-text-primary)", margin: 0, lineHeight: 1.1 }}>Our Services</h2>
      </motion.div>
      <style>{".flip-card{perspective:1000px;height:clamp(260px,28vw,340px)}.flip-card-inner{position:relative;width:100%;height:100%;transition:transform 0.55s cubic-bezier(0.22,1,0.36,1);transform-style:preserve-3d}.flip-card:hover .flip-card-inner{transform:rotateY(180deg)}.flip-card-front,.flip-card-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:.75rem;border:1px solid var(--obs-border,rgba(128,128,128,0.18));display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(1.45rem,2.2vw,2rem);gap:1rem}.flip-card-front{background:transparent;transition:border-color 0.25s ease}.flip-card:hover .flip-card-front{border-color:#F58134}.flip-card-back{background:rgba(245,129,52,0.07);border-color:rgba(245,129,52,0.35);transform:rotateY(180deg);text-align:center}"}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(1rem, 2vw, 1.5rem)", justifyContent: "center" }}>
        {services.map((service, index) => (
          <motion.div key={index} className="flip-card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={service.icon} alt={service.title} style={{ width: "clamp(74px, 9vw, 112px)", height: "clamp(74px, 9vw, 112px)", objectFit: "contain" }} />
                <p style={{ fontSize: "clamp(1.35rem, 1.7vw, 1.58rem)", fontWeight: 400, color: "var(--obs-text-primary)", margin: 0, textAlign: "center", lineHeight: 1.3 }}>{service.title}</p>
              </div>
              <div className="flip-card-back">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#F58134" }}>{service.title}</span>
                <p style={{ fontSize: "clamp(1.08rem, 1.28vw, 1.22rem)", color: "var(--obs-text-primary)", opacity: 0.75, margin: 0, lineHeight: 1.65 }}>{service.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Services;