import { motion } from "framer-motion";
import { twMerge } from "src/Utils/cn";
import { useTheme } from "src/Hooks/useTheme";
import consultingData from "../Data/consulting.json";

const Clients = () => {
  const clients = consultingData.clients;
  const { isDark } = useTheme();
  const darkLogoFilter = "brightness(1.14) contrast(1.08) saturate(0.95)";
  const lightToDarkLogoMap: Record<string, string> = {
    "/Partners/jacobs.png": "/Partners/jacobs_dark.png",
    "/Partners/scripps.png": "/Partners/scripps_dark.png",
    "/Partners/scids_light.png": "/Partners/scids_dark.png",
  };
  const resolveClientLogo = (src: string) => (isDark ? lightToDarkLogoMap[src] ?? src : src);

  const isCerNrsLogo = (logo: string) =>
    logo === "/Consulting/cer.png" || logo === "/Consulting/nrs.png";

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="mb-[0.7rem] flex items-center gap-[0.6rem]">
          <div className="h-0.5 w-[22px] shrink-0 rounded-sm bg-[#a78bfa]" />
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[#a78bfa]">Who we&apos;ve worked with</span>
        </div>
        <h2 className="m-0 font-heading text-[clamp(2rem,3.4vw,3.1rem)] font-normal leading-tight text-(--obs-text-primary)">
          Our Clients
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-[repeat(auto-fill,minmax(clamp(120px,18vw,200px),1fr))] border-l border-t border-(--obs-border)"
      >
        {clients.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="flex items-center justify-center border-b border-r border-(--obs-border) p-[1.5rem_2rem] transition-colors duration-200 hover:bg-[var(--obs-surface,rgba(128,128,128,0.05))]"
          >
            <img
              src={resolveClientLogo(client.logo)}
              alt=""
              title={client.name}
              className={twMerge(
                "object-contain opacity-[0.82] transition-[opacity,filter] duration-200 hover:opacity-100",
                isCerNrsLogo(client.logo)
                  ? "h-[clamp(160px,22vw,220px)] w-full max-w-[360px]"
                  : "h-[100px] w-[150%]"
              )}
              style={{ filter: isDark ? darkLogoFilter : "none" }}
              onError={e => {
                e.currentTarget.style.display = "none";
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Clients;
