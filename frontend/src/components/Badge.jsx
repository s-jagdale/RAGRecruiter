import { cn } from "../utils/cn";

const tones = {
  primary: "bg-primary-50 text-primary-700",
  neutral: "bg-ink-900/5 text-ink-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
};

export default function Badge({ tone = "primary", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
