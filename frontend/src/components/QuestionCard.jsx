import Badge from "./Badge";
import { trackLabel } from "../utils/format";

export default function QuestionCard({ question, index, total }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Badge tone="primary">
          Question {index + 1} of {total}
        </Badge>
        {question.question_type && <Badge tone="neutral">{trackLabel(question.question_type)}</Badge>}
      </div>
      <h2 className="text-xl font-semibold leading-snug text-ink-900 sm:text-2xl">
        {question.question_text}
      </h2>
      {question.targets_gap && (
        <p className="mt-3 text-sm text-ink-500">Targeting: {question.targets_gap}</p>
      )}
    </div>
  );
}
