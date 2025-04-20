export type StarType = {
  x: number;
  y: number;
  w: number;
};

export type EventType = {
  title: string;
  date?: string;
  link: string;
  image?: string;
  location?: string;
  description: string;
};

export type TeamType = {
  title: string;
  subtitle: string;
  name?: string;
  image?: string;
  points?: {
    title: string;
    description: string;
  }[];
};
