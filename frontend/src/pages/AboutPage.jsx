import { Bot, Target, ShieldCheck } from "lucide-react";
import Card from "../components/Card";

const points = [
  {
    icon: Bot,
    title: "AI-powered, resume-grounded",
    body: "Every question set is generated from a gap analysis between your actual resume and the role you're targeting — not a static question bank.",
  },
  {
    icon: Target,
    title: "Track-adaptive",
    body: "Technical, Soft Skills, Behavioral, or Mixed — the AI adapts its gap analysis, questions, and scoring rubric to the track you choose.",
  },
  {
    icon: ShieldCheck,
    title: "Built on IBM watsonx.ai",
    body: "Question generation, scoring, and feedback are all powered by IBM's Granite models via watsonx.ai, grounded with retrieval over a curated interview knowledge base.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-bold">About RAGRecruiter</h1>
      <p className="mt-4 text-ink-500">
        RAGRecruiter is an AI interview practice platform that pairs your resume against your
        target role, generates a tailored question set, and scores every answer — so you walk
        into the real interview knowing exactly where you stand.
      </p>

      <div className="mt-10 space-y-6">
        {points.map((p) => (
          <Card key={p.title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <p.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-ink-900">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{p.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
