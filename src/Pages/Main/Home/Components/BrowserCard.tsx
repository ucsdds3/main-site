import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { newArray } from "../../../../Utils/functions.tsx";
import SafeLink from "../../../../Components/SafeLink.tsx";
import { memo, useState } from "react";

interface BrowserCardProps {
  title: string;
  link?: string;
  image?: string;
  description?: string;
  delay?: number;
  linkText?: string;
}

const BrowserCard = memo(function BrowserCard({
  title,
  link,
  image,
  description,
  delay = 0,
  linkText = "View",
}: BrowserCardProps) {
  const navigate = useNavigate();
  const notEvent = link?.startsWith("www.ds3atucsd.com");
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay,
      }}
      className={`relative w-full h-full pt-6 px-10 pb-6 rounded-2xl bg-base-400 border border-[var(--initial-border-color)] hover:border-[var(--border-color)] duration-150 flex flex-col gap-2 group ${
        notEvent ? "cursor-pointer" : ""
      }`}
      onClick={notEvent ? () => navigate(link?.replace("www.ds3atucsd.com", "") || "") : undefined}
    >
      <div className="flex justify-between items-center gap-6 mb-2">
        <span className="w-[80%] h-6 px-4  truncate rounded-full text-[var(--link-textcolor)] bg-base-300 hover:underline">
          {link}
        </span>
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-[#F58134] rounded-full" />
          <span className="w-3 h-3 bg-[#11B3C9] rounded-full" />
          <span className="w-3 h-3 bg-[#434343] rounded-full" />
        </div>
      </div>

      <div className="pl-2 flex flex-col">
        <h4 className="text-4xl font-bold line-clamp-3">{title}</h4>
      </div>

      <div className="group overflow-hidden relative inline-block skeleton w-full aspect-[1.4/1] rounded-lg">
        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="object-cover aspect-[1.4/1] transition-transform duration-300 group-hover:scale-105"
            onError={e => {
              console.log("Image error", e);
              setImageError(true);
            }}
            style={{ display: "block" }}
          />
        ) : (
          <div className="skeleton w-full aspect-[1.4/1] rounded-lg" />
        )}
      </div>

      {description ? (
        <p className="text-2xl font-light my-2 line-clamp-5 text-[var(--card-textcolor)]">
          {description}
        </p>
      ) : (
        <div className="md:max-h-[35%] overflow-y-auto w-full">
          {newArray(4).map((_, index) => (
            <div className="h-7 m-1 w-auto skeleton" key={index} />
          ))}
        </div>
      )}

      {!notEvent &&
        (link ? (
          <SafeLink
            href={link}
            className="text-lg text-center font-semibold rounded-md bg-(--color-primary) self-start hover:brightness-110 mt-auto py-2 px-6"
          >
            {linkText}
          </SafeLink>
        ) : (
          <div className="h-10 m-1 mt-auto rounded-md w-[50%] skeleton" />
        ))}
    </motion.div>
  );
});

export default BrowserCard;
