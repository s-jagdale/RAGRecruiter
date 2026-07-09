import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

export default function LoadingSpinner({ label, size = 24, className, fullPage = false }) {
  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-ink-500", className)}>
      <Loader2 className="animate-spin text-primary-500" style={{ width: size, height: size }} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>;
  }
  return spinner;
}
