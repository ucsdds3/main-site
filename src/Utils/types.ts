export type EventType = {
  name: string;
  date?: string;
  points: string;
  image?: string;
  deleted?: boolean;
  password?: string;
  start?: string;
  end?: string;
  tags?: string[];
  location?: string;
  description: string;
};

export type TeamType = {
  title?: string;
  subtitle?: string;
  name?: string;
  image?: string;
  headerImg?: string;
  points?: Record<string, React.ReactNode>;
};

export type MemberType = {
  name: string;
  role?: string;
  teams?: string[];
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

export type ProjectType = {
  title: string;
  description: string;
  image: string;
  link?: string;
  placement?: 1 | 2 | 3;
};

export type NavigateProps = {
  pathname?: string;
  subdomain?: string;
  target?: string;
  hash?: string;
};

export type AuthState =
  | "signin"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "authenticated";

export type PortalMemberType = {
  id: number;
  name: string;
  points: number;
  experience: number;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  email: string;
  admin_level: number | null;
};

export const tagColor = {
  Professional: "badge-info",
  Workshop: "badge-warning",
  Social: "badge-success",
  Other: "",
};

export type EventTagType = keyof typeof tagColor;
