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
  title?: string;
  committees?: Committee[];
  image?: string;
  links?: Record<string, React.ReactNode>;
  bio?: string;
};
