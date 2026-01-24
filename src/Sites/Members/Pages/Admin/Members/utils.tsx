export const tiers = ["Rookie", "Bronze", "Silver", "Gold", "Platinum"];

export function getTier(experience: number): string {
  const level = Math.max(Math.floor(Math.log2(experience / 1000)) + 1, 0);
  return tiers[level] || "Rookie";
}

export function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

export function ToggleRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <fieldset className="fieldset rounded-box w-64 ">
      <label className="label">
        <input
          type="checkbox"
          defaultChecked
          className="toggle toggle-primary"
          checked={checked}
          onClick={onClick}
        />
        {label}
      </label>
    </fieldset>
  );
}
