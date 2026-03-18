import { motion } from "framer-motion";
import { useTheme } from "src/Hooks/useTheme";
import consultingData from "../Data/consulting.json";

const Clients = () => {
  const clients = consultingData.clients;
  const { isDark } = useTheme();
  const darkLogoFilter = "brightness(1.14) contrast(1.08) saturate(0.95)";

  return (
    <div style={{ width: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "2rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
          <div style={{ width: 22, height: 2, background: "#a78bfa", borderRadius: 2 }} />
          <span style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#a78bfa",
          }}>Who we've worked with</span>
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
          fontWeight: 400,
          color: "var(--obs-text-primary)",
          margin: 0,
          lineHeight: 1.1,
        }}>Our Clients</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(120px, 18vw, 200px), 1fr))",
          borderTop: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
          borderLeft: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
        }}
      >
        {clients.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem 2rem",
              borderRight: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
              borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.18))",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--obs-surface, rgba(128,128,128,0.05))")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <img
              src={client.logo}
              alt=""
              title={client.name}
              style={{
                height: 56,
                width: "100%",
                objectFit: "contain",
                opacity: 0.75,
                transition: "opacity 0.2s ease, filter 0.2s ease",
                filter: isDark ? darkLogoFilter : "none",
              }}
              onError={e => (e.currentTarget.style.display = "none")}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.75")}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Clients;