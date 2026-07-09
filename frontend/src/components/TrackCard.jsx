import { Code2, Users, MessagesSquare, Layers } from "lucide-react";
import { cn } from "../utils/cn";

const icons = {
  technical: Code2,
  soft_skills: Users,
  behavioral: MessagesSquare,
  mixed: Layers,
};

export default function TrackCard({ track, selected, onSelect }) {
  const Icon = icons[track.id] || Layers;
  return (
    <button
      onClick={() => onSelect(track.id)}
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl2 p-6 text-left transition-all duration-200",
        "bg-navy-900 text-white hover:-translate-y-1 hover:shadow-card-hover",
        selected && "ring-2 ring-primary-400 ring-offset-2"
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-display text-lg font-semibold">{track.label}</h3>
      <p className="text-sm text-white/70">{track.description}</p>
    </button>
  );
}
