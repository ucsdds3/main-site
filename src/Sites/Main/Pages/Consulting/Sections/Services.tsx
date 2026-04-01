import { motion } from "framer-motion";
import consultingData from "../Data/consulting.json";

const FLIP_FACE =
  "absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl p-[clamp(1.45rem,2.2vw,2rem)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

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
          <motion.div
            key={index}
            className="group h-[clamp(260px,28vw,340px)] [perspective:1000px]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-full w-full transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              <div
                className={`${FLIP_FACE} border border-(--obs-border) bg-transparent transition-[border-color] duration-200 group-hover:border-[#F58134]`}
              >
                <img src={service.icon} alt={service.title} className="fl-size-[74px/112px] object-contain" />
                <p className="m-0 text-center font-heading font-normal leading-snug text-(--obs-text-primary) fl-text-xl/2xl">
                  {service.title}
                </p>
              </div>
              <div
                className={`${FLIP_FACE} border border-[rgba(245,129,52,0.35)] bg-[rgba(245,129,52,0.07)] text-center [transform:rotateY(180deg)]`}
              >
                <span className="font-mono text-[0.78rem] font-normal uppercase tracking-[0.18em] text-[#F58134]">
                  {service.title}
                </span>
                <p className="m-0 font-body leading-[1.65] text-(--obs-text-primary) opacity-75 fl-text-lg/xl">
                  {service.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Services;
