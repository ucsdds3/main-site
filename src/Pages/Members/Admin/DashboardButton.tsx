export default function DashboardButton({
  children,
  variant = "default",
  className,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "default" | "orange" | "ghost";
  className?: string;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition border cursor-pointer bg-base-200  " +
    className;
  const styles: Record<string, string> = {
    default: "border-white/10 text-white/80 hover:bg-white/10",
    orange: "border-(--color-primary) text-white hover:bg-orange-500/20",
    ghost: "border-transparent bg-transparent text-white hover:bg-white/10",
  };

  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}
