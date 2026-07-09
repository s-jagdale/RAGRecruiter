import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowRight, Info } from "lucide-react";
import { uploadResume } from "../api/resume";
import { startSession } from "../api/interview";
import { useInterviewSession } from "../hooks/useInterviewSession";
import { CURATED_ROLES, ROUTES } from "../constants";
import ResumeUploader from "../components/ResumeUploader";
import Card from "../components/Card";
import Select from "../components/Select";
import Input from "../components/Input";
import Button from "../components/Button";

export default function InterviewSetupPage() {
  const { session, setResume, setSetupDetails, startSessionState } = useInterviewSession();
  const navigate = useNavigate();

  const [roleChoice, setRoleChoice] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [jobDescription, setJobDescription] = useState(session.jobDescription || "");

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      setResume(data.extracted_text, data.filename);
      toast.success("Resume parsed successfully.");
    },
    onError: (err) => toast.error(err.message || "Could not parse that resume."),
  });

  const startMutation = useMutation({
    mutationFn: startSession,
    onSuccess: (data) => {
      startSessionState(data);
      navigate(ROUTES.INTERVIEW_SCREEN);
    },
    onError: (err) => toast.error(err.message || "Could not start the session."),
  });

  const jobRole = roleChoice === "other" ? customRole.trim() : roleChoice;
  const canSubmit = !!session.resumeText && !!jobRole && !!session.track;

  const handleSubmit = () => {
    if (!session.track) {
      toast.error("Pick a track first.");
      navigate(ROUTES.TRACK_SELECTION);
      return;
    }
    if (!canSubmit) return;
    setSetupDetails(jobRole, jobDescription);
    startMutation.mutate({ resumeText: session.resumeText, jobRole, jobDescription, track: session.track });
  };

  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="text-3xl font-bold">Set up your interview</h1>
      <p className="mt-2 text-ink-500">A few details so we can tailor your questions.</p>

      <Card className="mt-8 space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Resume</label>
          <ResumeUploader
            isUploading={uploadMutation.isPending}
            uploadedFilename={session.resumeFilename}
            onFileSelected={(file) => uploadMutation.mutate(file)}
            onClear={() => setResume("", "")}
          />
        </div>

        <Select
          label="Target job role"
          value={roleChoice}
          onChange={(e) => setRoleChoice(e.target.value)}
        >
          <option value="" disabled>
            Select a role
          </option>
          {CURATED_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
          <option value="other">Other (type your own)</option>
        </Select>

        {roleChoice === "other" && (
          <Input
            label="Custom job role"
            placeholder="e.g. Product Manager"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
          />
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Job description <span className="font-normal text-ink-500">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here for extra context..."
            className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Used to tailor your gap analysis and questions to this specific posting, alongside your
            resume.
          </p>
        </div>

        <Button
          size="lg"
          icon={ArrowRight}
          className="w-full"
          disabled={!canSubmit}
          isLoading={startMutation.isPending}
          onClick={handleSubmit}
        >
          Generate my questions
        </Button>
      </Card>
    </div>
  );
}
