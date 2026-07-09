import { cn } from "../utils/cn";

export default function Card({ className, children, hoverable = false, dark = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl2 border p-6 transition-shadow duration-200",
        dark
          ? "bg-navy-900 border-white/5 text-white"
          : "bg-white border-ink-900/5 shadow-card",
        hoverable && "hover:shadow-card-hover hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
