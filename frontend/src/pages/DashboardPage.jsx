import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, History as HistoryIcon, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchInterviewHistory } from "../api/history";
import { ROUTES } from "../constants";
import Card from "../components/Card";
import Button from "../components/Button";
import AnalyticsCard from "../components/AnalyticsCard";
import InterviewCard from "../components/InterviewCard";
import LoadingSpinner from "../components/LoadingSpinner";
import WatsonAssistantWidget from "../components/WatsonAssistantWidget";
import { averageScore } from "../utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: history, isLoading } = useQuery({
    queryKey: ["interview-history"],
    queryFn: fetchInterviewHistory,
  });

  const completed = history?.filter((h) => h.readiness_score != null) || [];
  const avgReadiness = averageScore(completed.map((h) => h.readiness_score));
  const recent = history?.slice(0, 3) || [];

  return (
    <div className="container-page py-12">
      <WatsonAssistantWidget />

      <h1 className="text-2xl font-bold">Welcome back, {user?.username} 👋</h1>
      <p className="mt-1 text-ink-500">Here's where you left off.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <AnalyticsCard icon={HistoryIcon} label="Interviews completed" value={completed.length} />
        <AnalyticsCard icon={TrendingUp} label="Average readiness" value={completed.length ? `${avgReadiness}/10` : "—"} />
        <AnalyticsCard icon={BarChart3} label="Total sessions" value={history?.length ?? 0} />
      </div>

      <Card className="mt-8 flex flex-col items-start justify-between gap-4 bg-primary-gradient text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Sparkles className="h-5 w-5" /> Ready for another round?
          </h2>
          <p className="mt-1 text-white/80">Start a new mock interview tailored to your target role.</p>
        </div>
        <Link to={ROUTES.TRACK_SELECTION}>
          <Button variant="secondary" icon={ArrowRight}>
            New Interview
          </Button>
        </Link>
      </Card>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent sessions</h2>
          <Link to={ROUTES.HISTORY} className="text-sm font-semibold text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {isLoading && <LoadingSpinner label="Loading your sessions..." />}

        {!isLoading && recent.length === 0 && (
          <Card className="text-center text-ink-500">
            No interviews yet. Start your first mock interview to see it here.
          </Card>
        )}

        <div className="space-y-4">
          {recent.map((record) => (
            <InterviewCard key={record.id} record={record} onView={() => {}} onDelete={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}