export const FUNDRAISER_COLORS = [
  "#19B5CA",
  "#F58134",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#facc15",
  "#60a5fa",
  "#fb7185",
  "#2dd4bf",
  "#c084fc",
] as const;

export const QUARTER_SEASONS = ["FA", "WI", "SP", "SU"] as const;

export type QuarterSeason = (typeof QUARTER_SEASONS)[number];

const SEASON_LABELS: Record<QuarterSeason, string> = {
  FA: "Fall",
  WI: "Winter",
  SP: "Spring",
  SU: "Summer",
};

export type FundraisingGoalRow = {
  id: number;
  quarter_key: string;
  goal_amount: number;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type FundraiserRow = {
  id: number;
  goal_id: number;
  held_on: string;
  place: string;
  amount: number;
  color: string;
  created_by: number;
  created_at: string;
};

export const FIRST_FUNDRAISING_QUARTER = "FA26";

const SEASON_ORDER: Record<QuarterSeason, number> = {
  FA: 0,
  WI: 1,
  SP: 2,
  SU: 3,
};

export function nextQuarterKey(key: string): string {
  const season = key.slice(0, 2) as QuarterSeason;
  const year = 2000 + Number(key.slice(2));
  if (season === "FA") return `WI${String(year + 1).slice(-2)}`;
  if (season === "WI") return `SP${String(year).slice(-2)}`;
  if (season === "SP") return `SU${String(year).slice(-2)}`;
  return `FA${String(year).slice(-2)}`;
}

export function currentQuarterKey(now = new Date()): string {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const season: QuarterSeason = month <= 3 ? "WI" : month <= 6 ? "SP" : month <= 8 ? "SU" : "FA";
  const key = `${season}${String(year).slice(-2)}`;
  return quarterComesBefore(key, FIRST_FUNDRAISING_QUARTER) ? FIRST_FUNDRAISING_QUARTER : key;
}

function quarterComesBefore(a: string, b: string): boolean {
  return quarterSortValue(a) < quarterSortValue(b);
}

function quarterSortValue(key: string): number {
  const season = key.slice(0, 2) as QuarterSeason;
  const year = 2000 + Number(key.slice(2));
  const academicStart = season === "FA" ? year : year - 1;
  return academicStart * 4 + (SEASON_ORDER[season] ?? 0);
}

export function quarterLabel(key: string): string {
  const season = key.slice(0, 2) as QuarterSeason;
  const yy = key.slice(2);
  const year = 2000 + Number(yy);
  return `${SEASON_LABELS[season] ?? key} ${Number.isFinite(year) ? year : yy}`;
}

export function nearbyQuarterOptions(): { key: string; label: string }[] {
  const keys: string[] = [];
  let key = FIRST_FUNDRAISING_QUARTER;
  for (let i = 0; i < 12; i++) {
    keys.push(key);
    key = nextQuarterKey(key);
  }
  return keys.map(item => ({ key: item, label: quarterLabel(item) }));
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function nextFundraiserColor(existing: string[]): string {
  const used = new Set(existing.map(c => c.toLowerCase()));
  const unused = FUNDRAISER_COLORS.find(color => !used.has(color.toLowerCase()));
  if (unused) return unused;
  return FUNDRAISER_COLORS[existing.length % FUNDRAISER_COLORS.length];
}

export function formatFundraiserDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
