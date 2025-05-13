import committees from "../Assets/Data/committees.json";

export type CommitteeType = keyof typeof committees;

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
  points?: Record<string, React.ReactNode>;
};

export type MemberType = {
  name: string;
  role?: string;
  committees?: CommitteeType[];
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

export type cardData = {
  image: string;
  title: string;
  description: string;
  author: string;
};

export type datahacksWinner =
  | {
      title: string;
      description: string;
      members: string[];
      category: string;
      image: string;
      devpost: string;
      github: string;
    }
  | {
      title: string;
      description: string;
      members: string[];
      category: string;
      image: string;
      devpost: string;
      github?: undefined;
    };
