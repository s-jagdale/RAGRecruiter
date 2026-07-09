import { useQuery } from "@tanstack/react-query";
import { User, Mail, FileText } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchResumeHistory } from "../api/resume";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/format";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: resumes, isLoading } = useQuery({
    queryKey: ["resume-history"],
    queryFn: fetchResumeHistory,
  });

  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="mt-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient text-xl font-bold text-white">
            {user?.username?.[0]?.toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-ink-900">{user?.username}</p>
            <p className="flex items-center gap-1.5 text-sm text-ink-500">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
            </p>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-surface-muted p-3 text-xs text-ink-500">
          <User className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Profile editing isn't available yet — the backend doesn't expose an update endpoint or
          extra profile fields (avatar, bio, etc.) beyond what you registered with.
        </p>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink-900">
          <FileText className="h-5 w-5 text-primary-500" /> Resume uploads
        </h2>
        {isLoading && <LoadingSpinner label="Loading resumes..." />}
        {!isLoading && resumes?.length === 0 && (
          <p className="text-sm text-ink-500">No resumes uploaded yet.</p>
        )}
        <ul className="space-y-3">
          {resumes?.map((r) => (
            <li key={r.id} className="rounded-lg border border-ink-900/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-900">{r.filename}</span>
                <span className="text-xs text-ink-500">{formatDate(r.uploaded_at)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-ink-500">{r.preview}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
