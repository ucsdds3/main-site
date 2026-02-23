import { LinkType, MemberType, EventType } from "./types";
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

export const unbreakable = (str: string) =>
  str.replace(/[ -]/g, match => (match === " " ? "\u00A0" : "\u2011")); // Non breaking space and hyphen

export const parseToPST = (dateString: string) => {
  return new Date(
    new Date(dateString).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
};

export const getNextDeadline = (deadlines: Record<string, string>) =>
  Object.entries(deadlines)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => parseToPST(value) > new Date())
    .sort((a, b) => parseToPST(a[1]).getTime() - parseToPST(b[1]).getTime())[0];

export const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollIntoView({ behavior: "smooth" });
};

export const validateResumeLink = (inTalentPool: boolean, resumeLink?: string): boolean => {
  if (!inTalentPool) return true;
  if (!resumeLink || typeof resumeLink !== "string") return false;
  try {
    new URL(resumeLink);
    return true;
  } catch {
    return false;
  }
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

/**
 * Generates a Google Calendar add event URL from event data
 * @param event - Event data containing name, start, end, description, and optional location
 * @returns Google Calendar URL or empty string if start or end is missing
 */
export const generateCalendarLink = (event: EventType): string => {
  if (!event.start || !event.end) return "";

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  // Format dates to ISO 8601 format (YYYYMMDDTHHmmssZ)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || "",
    ...(event.location && { location: event.location }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US");
};

