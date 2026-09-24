/**
 * Newsletter email export filters for Members admin.
 *
 * Alumni rule: after June 1 of calendar year Y, class Y has graduated.
 * Before June: class Y−1 is the latest graduated class.
 * Example (Sep 2026): alumni if graduation_year ≤ 2026; keep 2027+.
 */

export type NewsletterMemberRow = {
  email?: unknown;
  full_name?: unknown;
  graduation_year?: unknown;
  deleted?: unknown;
};

export function parseGraduationYear(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  const year = Math.trunc(n);
  // Guard against junk values like 9999999999999 in the DB.
  if (year < 1990 || year > 2100) return null;
  return year;
}

/** Latest class year that has already graduated as of `now`. */
export function latestGraduatedClassYear(now = new Date()): number {
  const y = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan … 5 = June
  return month >= 5 ? y : y - 1;
}

export function isUcSdEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  // Allow ucsd.edu and subdomains (e.g. eng.ucsd.edu).
  return /@[a-z0-9.-]*ucsd\.edu$/.test(normalized);
}

export function isAlumniByGraduationYear(
  graduationYear: unknown,
  now = new Date()
): boolean {
  const year = parseGraduationYear(graduationYear);
  if (year == null) return true; // unknown / invalid → exclude from newsletter
  return year <= latestGraduatedClassYear(now);
}

export function isActiveMember(row: NewsletterMemberRow): boolean {
  return row.deleted !== true;
}

/** Rows eligible for the newsletter CSV (active UCSD, not alumni). */
export function filterNewsletterMembers<T extends NewsletterMemberRow>(
  rows: T[],
  now = new Date()
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];

  for (const row of rows) {
    if (!isActiveMember(row)) continue;
    if (!isUcSdEmail(row.email)) continue;
    if (isAlumniByGraduationYear(row.graduation_year, now)) continue;

    const key = String(row.email).trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }

  return out;
}

export function downloadNewsletterEmailsCsv(
  rows: NewsletterMemberRow[],
  now = new Date()
): { count: number } {
  const filtered = filterNewsletterMembers(rows, now);
  const headers = ["email", "full_name", "graduation_year"];
  const lines = [
    headers.join(","),
    ...filtered.map(row => {
      const email = String(row.email ?? "").trim();
      const name = String(row.full_name ?? "").trim();
      const gy = parseGraduationYear(row.graduation_year);
      const cells = [email, name, gy == null ? "" : String(gy)].map(
        c => `"${c.replace(/"/g, '""')}"`
      );
      return cells.join(",");
    }),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const date = now.toISOString().slice(0, 10);
  link.href = url;
  link.download = `newsletter_ucsd_emails_${date}.csv`;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { count: filtered.length };
}
