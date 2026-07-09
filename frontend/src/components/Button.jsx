import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

const variants = {
  primary:
    "bg-primary-gradient text-white shadow-glow hover:brightness-110 active:brightness-95",
  secondary:
    "bg-white text-ink-900 border border-ink-900/10 hover:border-primary-300 hover:text-primary-700",
  ghost: "bg-transparent text-ink-700 hover:bg-primary-50 hover:text-primary-700",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
};

const sizes = {
  sm: "text-sm px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3.5",
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", isLoading = false, className, children, disabled, icon: Icon, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
});

export default Button;
