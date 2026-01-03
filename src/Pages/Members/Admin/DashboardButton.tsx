export default function DashboardButton({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "orange" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition border cursor-pointer " +
    className;
  const styles: Record<string, string> = {
    default: "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
    orange: "border-orange-500 text-white hover:bg-orange-500/20",
    ghost: "border-transparent bg-transparent text-white/70 hover:bg-white/5",
  };

  return <button className={`${base} ${styles[variant]}`}>{children}</button>;
}
