import { Mic } from "lucide-react";
import Card from "./Card";

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink-700">{label}</span>
        <span className="font-semibold text-ink-900">{value}/5</span>
      </div>
      <div className="h-2 w-full rounded-full bg-ink-900/5">
        <div
          className="h-2 rounded-full bg-primary-gradient transition-all duration-500"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function FeedbackCard({ result }) {
  if (!result) return null;
  const isVoice = typeof result.delivery_score === "number";

  return (
    <Card className="animate-in fade-in">
      <h3 className="mb-4 font-display text-lg font-semibold">Feedback on your answer</h3>
      <div className="space-y-3">
        <ScoreBar label="Clarity" value={result.clarity_score} />
        <ScoreBar label="Relevance" value={result.relevance_score} />
        <ScoreBar label="Depth" value={result.depth_score} />
        {isVoice && <ScoreBar label="Delivery" value={result.delivery_score} />}
      </div>

      {isVoice && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
          <span className="flex items-center gap-1.5">
            <Mic className="h-4 w-4" /> {result.wpm} WPM
          </span>
          <span>{result.filler_count} filler words</span>
          <span>Longest pause: {result.longest_pause}s</span>
        </div>
      )}

      <p className="mt-4 text-sm leading-relaxed text-ink-700">{result.feedback}</p>
    </Card>
  );
}
