import type { ReactNode } from "react";

export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-sm font-medium text-(--obs-text-muted)">{children}</span>
);

export const Chip = ({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "cyan" | "orange" | "neutral";
}) => {
  const toneClass =
    tone === "cyan"
      ? "border-[#19B5CA]/35 bg-[#19B5CA]/10 text-[#8eeaf4]"
      : tone === "orange"
        ? "border-[#F58134]/35 bg-[#F58134]/10 text-[#ffbd89]"
        : "border-(--obs-border-mid) bg-(--obs-surface) text-(--obs-text-primary)";

  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
};

export const ScoreTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-(--obs-border) bg-(--obs-surface) px-3 py-2">
    <div className="text-xs text-(--obs-text-muted)">{label}</div>
    <div className="mt-1 text-lg font-semibold text-(--obs-text-primary)">{value}</div>
  </div>
);

export const ActionLink = ({ href, children }: { href: string; children: ReactNode }) => {
  if (!href) return null;

  return (
    <a
      className="inline-flex items-center justify-center gap-2 rounded-md border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm font-medium text-(--obs-text-primary) transition hover:border-[#19B5CA]/45 hover:bg-[#19B5CA]/10"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
};
