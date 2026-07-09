import Card from "./Card";
import { cn } from "../utils/cn";

export default function AnalyticsCard({ icon: Icon, label, value, trend, className }) {
  return (
    <Card className={cn("flex items-start justify-between", className)}>
      <div>
        <p className="text-sm text-ink-500">{label}</p>
        <p className="mt-2 font-display text-3xl font-bold text-ink-900">{value}</p>
        {trend && <p className="mt-1 text-sm text-primary-600">{trend}</p>}
      </div>
      {Icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" />
        </span>
      )}
    </Card>
  );
}
