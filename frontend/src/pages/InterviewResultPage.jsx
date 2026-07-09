import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Lightbulb, RotateCcw, Home } from "lucide-react";
import { useInterviewSession } from "../hooks/useInterviewSession";
import { ROUTES } from "../constants";
import Card from "../components/Card";
import Button from "../components/Button";

function readinessColor(score) {
  if (score >= 8) return "text-emerald-500";
  if (score >= 5) return "text-amber-500";
  return "text-red-500";
}

export default function InterviewResultPage() {
  const { session, resetSession } = useInterviewSession();
  const navigate = useNavigate();
  const { summary } = session;

  useEffect(() => {
    if (!summary) {
      navigate(ROUTES.TRACK_SELECTION, { replace: true });
    }
  }, [summary, navigate]);

  if (!summary) return null;

  const handleRestart = () => {
    resetSession();
    navigate(ROUTES.TRACK_SELECTION);
  };

  return (
    <div className="container-page max-w-2xl py-12">
      <Card className="text-center">
        <p className="text-sm font-semibold text-primary-600">Interview Complete</p>
        <p className={`mt-2 font-display text-6xl font-bold ${readinessColor(summary.readiness_score)}`}>
          {summary.readiness_score}
          <span className="text-2xl text-ink-300">/10</span>
        </p>
        <p className="mt-1 text-ink-500">Overall readiness score</p>
      </Card>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Strengths
          </h3>
          <ul className="space-y-2 text-sm text-ink-700">
            {summary.strengths?.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink-900">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Areas to improve
          </h3>
          <ul className="space-y-2 text-sm text-ink-700">
            {summary.gaps?.map((g, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {g}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink-900">
          <Lightbulb className="h-5 w-5 text-primary-500" /> Recommendations
        </h3>
        <ul className="space-y-2 text-sm text-ink-700">
          {summary.recommendations?.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              {r}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button icon={RotateCcw} onClick={handleRestart}>
          Start another interview
        </Button>
        <Button variant="secondary" icon={Home} onClick={() => navigate(ROUTES.DASHBOARD)}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
