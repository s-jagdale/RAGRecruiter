import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ROUTES } from "../constants";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "AI Interviews", to: ROUTES.TRACK_SELECTION },
      { label: "Resume Analysis", to: ROUTES.INTERVIEW_SETUP },
      { label: "Analytics", to: ROUTES.ANALYTICS },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "About", to: ROUTES.ABOUT },
      { label: "History", to: ROUTES.HISTORY },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "#" },
      { label: "Terms of Service", to: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="container-page grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-gradient">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            RAGRecruiter
          </div>
          <p className="mt-3 max-w-xs text-sm">
            Accelerating candidates' hiring journey with AI-powered mock interviews and
            personalized feedback.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="mb-3 text-sm font-semibold text-white">{col.heading}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs">
        © {new Date().getFullYear()} RAGRecruiter. All rights reserved.
      </div>
    </footer>
  );
}
