import { motion } from "framer-motion";
import consultingData from "../Data/consulting.json";

const Services = () => {
  const services = consultingData.services;
  return (
    <div className="w-full">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-[0.7rem] flex items-center gap-[0.6rem]">
          <div className="obs-accent-bar-orange" />
          <span className="text-eyebrow text-eyebrow-orange">What we offer</span>
        </div>
        <h2 className="text-fluid-section-title m-0 leading-tight text-(--obs-text-primary)">Our Services</h2>
      </motion.div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] justify-center gap-[clamp(1rem,2vw,1.5rem)]">
        {services.map((service, index) => (
          <motion.div key={index} className="flip-card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={service.icon} alt={service.title} className="fl-size-[74px/112px] object-contain" />
                <p className="m-0 text-center font-heading font-normal leading-snug text-(--obs-text-primary) fl-text-xl/2xl">{service.title}</p>
              </div>
              <div className="flip-card-back">
                <span className="font-mono text-[0.78rem] font-normal uppercase tracking-[0.18em] text-[#F58134]">{service.title}</span>
                <p className="m-0 font-body leading-[1.65] text-(--obs-text-primary) opacity-75 fl-text-lg/xl">{service.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Services;