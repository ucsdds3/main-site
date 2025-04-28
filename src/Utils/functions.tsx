import { LinkType, MemberType } from "./types";
import { IoMail } from "react-icons/io5";
import { FaGlobe, FaLinkedin } from "react-icons/fa6";
import { IoIosDocument } from "react-icons/io";

export const newArray = <T,>(length: number, value?: T): T[] =>
  Array.from({ length }, () => (value !== undefined ? value : (null as T)));

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const setIndex = <T,>(arr: T[], idx: number, value: T) => [
  ...arr.slice(0, idx),
  value,
  ...arr.slice(idx + 1),
];

export const unbreakable = (str: string) => str.replace(" ", "\u00A0"); // Non breaking space

export const hideImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.style.display = "none";
};

export const parseToPST = (dateString: string) => {
  return new Date(
    new Date(dateString).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
};

export const getNextDeadline = (deadlines: Record<string, string>) =>
  Object.entries(deadlines)
    .filter(([_, value]) => parseToPST(value) > new Date())
    .sort((a, b) => parseToPST(a[1]).getTime() - parseToPST(b[1]).getTime())[0];

export const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollIntoView({ behavior: "smooth" });
};

export const setSite = (site: "main" | "consulting") => {
  const params = new URLSearchParams(window.location.search);
  params.set("site", site);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, "", newUrl);
};

export const formatMemberLinks = ({ email, website, linkedIn, resume }: MemberType) =>
  [
    email && {
      title: "Email",
      icon: <IoMail />,
      href: `mailto:${email}`,
      color: "#F58134",
    },
    linkedIn && {
      title: "LinkedIn",
      icon: <FaLinkedin />,
      href: linkedIn,
      color: "#11B3C9",
    },
    resume && {
      title: "Resume",
      icon: <IoIosDocument />,
      href: resume,
      color: "#434343",
    },
    website && {
      title: "Website",
      icon: <FaGlobe />,
      href: website,
      color: "#222222",
    },
  ].filter(Boolean) as LinkType[];