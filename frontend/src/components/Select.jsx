import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils/cn";

const Select = forwardRef(function Select(
  { label, error, hint, className, id, children, ...props },
  ref
) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={cn(
            "w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-ink-900",
            "transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
            error ? "border-red-400" : "border-ink-900/10",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-sm text-ink-500">{hint}</p>}
    </div>
  );
});

export default Select;
