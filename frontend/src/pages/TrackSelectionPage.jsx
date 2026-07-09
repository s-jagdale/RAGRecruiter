import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TRACKS, ROUTES } from "../constants";
import { useInterviewSession } from "../hooks/useInterviewSession";
import TrackCard from "../components/TrackCard";
import Button from "../components/Button";

export default function TrackSelectionPage() {
  const { session, setTrack } = useInterviewSession();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!session.track) return;
    navigate(ROUTES.INTERVIEW_SETUP);
  };

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold">Choose your interview track</h1>
        <p className="mt-3 text-ink-500">
          This shapes the type of questions you'll be asked, and how your answers get scored.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} selected={session.track === track.id} onSelect={setTrack} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button size="lg" icon={ArrowRight} disabled={!session.track} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
