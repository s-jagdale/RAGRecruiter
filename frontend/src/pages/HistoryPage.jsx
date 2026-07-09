import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchInterviewHistory, deleteInterviewSession } from "../api/history";
import InterviewCard from "../components/InterviewCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { formatRoleLabel, trackLabel } from "../utils/format";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ["interview-history"],
    queryFn: fetchInterviewHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterviewSession,
    onSuccess: () => {
      toast.success("Interview removed.");
      queryClient.invalidateQueries({ queryKey: ["interview-history"] });
    },
    onError: (err) => toast.error(err.message || "Could not delete that record."),
  });

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-2xl font-bold">Interview History</h1>
      <p className="mt-1 text-ink-500">Review previous sessions and track how your answers evolve.</p>

      <div className="mt-8 space-y-4">
        {isLoading && <LoadingSpinner label="Loading history..." />}

        {!isLoading && history?.length === 0 && (
          <Card className="text-center text-ink-500">No interviews yet — your completed sessions will show up here.</Card>
        )}

        {history?.map((record) => (
          <InterviewCard
            key={record.id}
            record={record}
            onView={setSelected}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? formatRoleLabel(selected.job_role) : ""}>
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">{trackLabel(selected.track)}</Badge>
              {selected.readiness_score != null && <Badge tone="success">Readiness {selected.readiness_score}/10</Badge>}
            </div>
            {selected.summary?.strengths && (
              <div>
                <p className="mb-1 text-sm font-semibold text-ink-900">Strengths</p>
                <ul className="list-inside list-disc text-sm text-ink-700">
                  {selected.summary.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {selected.qa_log?.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-semibold text-ink-900">Questions asked</p>
                <ul className="max-h-56 space-y-2 overflow-y-auto text-sm text-ink-700">
                  {selected.qa_log.map((qa, i) => (
                    <li key={i} className="rounded-lg bg-surface-muted p-3">
                      {qa.question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
