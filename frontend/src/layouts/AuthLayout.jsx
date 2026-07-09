import { Link, Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ROUTES } from "../constants";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4 py-12">
      <div className="w-full max-w-md">
        <Link to={ROUTES.HOME} className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-gradient text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          RAGRecruiter
        </Link>
        <div className="rounded-xl2 border border-ink-900/5 bg-white p-8 shadow-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
