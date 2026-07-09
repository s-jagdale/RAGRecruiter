import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Award, ListChecks } from "lucide-react";
import { fetchInterviewHistory } from "../api/history";
import AnalyticsCard from "../components/AnalyticsCard";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/Badge";
import { averageScore, trackLabel } from "../utils/format";

export default function AnalyticsPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["interview-history"],
    queryFn: fetchInterviewHistory,
  });

  const stats = useMemo(() => {
    const completed = (history || []).filter((h) => h.readiness_score != null);
    const byTrack = {};
    completed.forEach((h) => {
      byTrack[h.track] = byTrack[h.track] || [];
      byTrack[h.track].push(h.readiness_score);
    });

    const gapFrequency = {};
    completed.forEach((h) => {
      (h.summary?.gaps || []).forEach((gap) => {
        gapFrequency[gap] = (gapFrequency[gap] || 0) + 1;
      });
    });
    const topGaps = Object.entries(gapFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Oldest -> newest for a simple trend read
    const chronological = [...completed].sort(
      (a, b) => new Date(a.completed_at) - new Date(b.completed_at)
    );

    return {
      totalCompleted: completed.length,
      avgReadiness: averageScore(completed.map((h) => h.readiness_score)),
      bestTrack: Object.entries(byTrack).sort((a, b) => averageScore(b[1]) - averageScore(a[1]))[0],
      topGaps,
      chronological,
    };
  }, [history]);

  if (isLoading) return <LoadingSpinner fullPage label="Crunching your analytics..." />;

  if (!stats.totalCompleted) {
    return (
      <div className="container-page max-w-3xl py-16 text-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-4 text-ink-500">
          Complete a few mock interviews to unlock performance trends and skill breakdowns here.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-12">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-ink-500">
        Computed from your interview history — there's no dedicated analytics endpoint on the
        backend yet, so these figures are aggregated client-side.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <AnalyticsCard icon={ListChecks} label="Interviews completed" value={stats.totalCompleted} />
        <AnalyticsCard icon={TrendingUp} label="Average readiness" value={`${stats.avgReadiness}/10`} />
        <AnalyticsCard
          icon={Award}
          label="Strongest track"
          value={stats.bestTrack ? trackLabel(stats.bestTrack[0]) : "—"}
        />
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink-900">
          <Target className="h-5 w-5 text-primary-500" /> Most common gaps identified
        </h2>
        {stats.topGaps.length === 0 ? (
          <p className="text-sm text-ink-500">No recurring gaps yet.</p>
        ) : (
          <ul className="space-y-3">
            {stats.topGaps.map(([gap, count]) => (
              <li key={gap} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{gap}</span>
                <Badge tone="neutral">{count}×</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 font-semibold text-ink-900">Readiness over time</h2>
        <div className="flex h-40 items-end gap-2">
          {stats.chronological.map((h) => (
            <div key={h.id} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-primary-gradient transition-all"
                style={{ height: `${(h.readiness_score / 10) * 100}%` }}
                title={`${h.readiness_score}/10`}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
