import committees from "../Assets/Data/committees.json";

export type Committee = keyof typeof committees;

export type EventType = {
  title: string;
  date?: string;
  link: string;
  image?: string;
  location?: string;
  description: string;
};

export type TeamType = {
  title?: string;
  subtitle?: string;
  name?: string;
  image?: string;
  points?: Record<string, string>;
};

export type MemberType = {
  name: string;
  role?: string;
  committees?: Committee[];
  image?: string;
  email?: string;
  website?: string;
  linkedIn?: string;
  resume?: string;
  bio?: string;
};

export type LinkType = {
  title: string;
  href: string;
  icon: React.ReactNode;
  color: string;
};
