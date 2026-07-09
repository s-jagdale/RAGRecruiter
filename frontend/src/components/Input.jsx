import { forwardRef } from "react";
import { cn } from "../utils/cn";

const Input = forwardRef(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300",
          "transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
          error ? "border-red-400" : "border-ink-900/10",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
