import { Trash2, ChevronRight } from "lucide-react";
import Card from "./Card";
import Badge from "./Badge";
import { formatDate, formatRoleLabel, trackLabel } from "../utils/format";

function readinessTone(score) {
  if (score >= 8) return "success";
  if (score >= 5) return "warning";
  return "danger";
}

export default function InterviewCard({ record, onView, onDelete }) {
  return (
    <Card hoverable className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="primary">{trackLabel(record.track)}</Badge>
          {record.readiness_score != null && (
            <Badge tone={readinessTone(record.readiness_score)}>
              Readiness {record.readiness_score}/10
            </Badge>
          )}
        </div>
        <h3 className="truncate font-semibold text-ink-900">{formatRoleLabel(record.job_role)}</h3>
        <p className="text-sm text-ink-500">
          {record.completed_at ? `Completed ${formatDate(record.completed_at)}` : `Started ${formatDate(record.started_at)}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onDelete(record.id)}
          aria-label="Delete interview record"
          className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={() => onView(record)}
          aria-label="View interview details"
          className="rounded-lg p-2 text-ink-500 hover:bg-primary-50 hover:text-primary-700"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </Card>
  );
}
