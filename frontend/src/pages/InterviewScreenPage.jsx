import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowRight, Lightbulb, Mic, Square, Send } from "lucide-react";
import { submitAnswer, submitVoiceAnswer, fetchIdealAnswer, endSession } from "../api/interview";
import { useInterviewSession } from "../hooks/useInterviewSession";
import { ROUTES } from "../constants";
import Card from "../components/Card";
import Button from "../components/Button";
import QuestionCard from "../components/QuestionCard";
import FeedbackCard from "../components/FeedbackCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function InterviewScreenPage() {
  const { session, recordAnswer, setSummary } = useInterviewSession();
  const navigate = useNavigate();

  const [answerText, setAnswerText] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [idealAnswer, setIdealAnswer] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const question = session.questions[session.currentIndex];
  const isLastQuestion = session.currentIndex === session.questions.length - 1;

  useEffect(() => {
    if (!session.sessionId) {
      navigate(ROUTES.TRACK_SELECTION, { replace: true });
    }
  }, [session.sessionId, navigate]);

  const answerMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (result) => {
      setLastResult(result);
      recordAnswer(question.question_text, answerText, result);
    },
    onError: (err) => toast.error(err.message || "Could not score that answer."),
  });

  const voiceMutation = useMutation({
    mutationFn: submitVoiceAnswer,
    onSuccess: (result) => {
      setLastResult(result);
      recordAnswer(question.question_text, result.transcript, result);
    },
    onError: (err) => toast.error(err.message || "Could not score that recording."),
  });

  const idealMutation = useMutation({
    mutationFn: fetchIdealAnswer,
    onSuccess: (data) => setIdealAnswer(data.ideal_answer),
    onError: (err) => toast.error(err.message || "Could not generate an ideal answer."),
  });

  const endMutation = useMutation({
    mutationFn: endSession,
    onSuccess: (summary) => {
      setSummary(summary);
      navigate(ROUTES.INTERVIEW_RESULT);
    },
    onError: (err) => toast.error(err.message || "Could not finalize your session."),
  });

const resetForNextQuestion = () => {
    setAnswerText("");
    setLastResult(null);
    setIdealAnswer(null);
  };

  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;
  const isAnswerTooShort = wordCount < 4;

  const handleSubmitText = () => {
    if (!answerText.trim()) return;
    if (isAnswerTooShort) {
      toast.error("Write a bit more before submitting — a few words isn't enough for real feedback.");
      return;
    }
    answerMutation.mutate({ sessionId: session.sessionId, questionText: question.question_text, answerText });
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        voiceMutation.mutate({ sessionId: session.sessionId, questionText: question.question_text, audioBlob: blob });
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast.error("Microphone access is required to record a voice answer.");
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      endMutation.mutate({ sessionId: session.sessionId });
    } else {
      resetForNextQuestion();
    }
  };

  if (!question) {
    return <LoadingSpinner fullPage label="Loading your interview..." />;
  }

  const isSubmittingAnswer = answerMutation.isPending || voiceMutation.isPending;

  return (
    <div className="container-page max-w-2xl py-12">
      <Card>
        <QuestionCard question={question} index={session.currentIndex} total={session.questions.length} />

        {!lastResult && (
          <div className="mt-6 space-y-4">
            <textarea
              rows={6}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              disabled={isRecording}
            />
            {answerText.trim().length > 0 && isAnswerTooShort && (
              <p className="text-xs text-amber-600">Add a bit more detail — at least a few sentences gets you real feedback.</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button icon={Send} isLoading={answerMutation.isPending} disabled={!answerText.trim() || isAnswerTooShort || isRecording} onClick={handleSubmitText}>
                Submit answer
              </Button>
              {!isRecording ? (
                <Button variant="secondary" icon={Mic} onClick={handleStartRecording} disabled={isSubmittingAnswer}>
                  Answer with voice
                </Button>
              ) : (
                <Button variant="danger" icon={Square} onClick={handleStopRecording}>
                  Stop recording
                </Button>
              )}
              {voiceMutation.isPending && <LoadingSpinner size={20} label="Transcribing & scoring..." />}
            </div>
          </div>
        )}

        {lastResult && (
          <div className="mt-6 space-y-4">
            <FeedbackCard result={lastResult} />

            {!idealAnswer ? (
              <Button
                variant="ghost"
                icon={Lightbulb}
                isLoading={idealMutation.isPending}
                onClick={() => idealMutation.mutate({ sessionId: session.sessionId, questionText: question.question_text })}
              >
                See an ideal answer
              </Button>
            ) : (
              <Card className="bg-primary-50 border-primary-100">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                  <Lightbulb className="h-4 w-4" /> Ideal answer
                </p>
                <p className="text-sm leading-relaxed text-ink-700">{idealAnswer}</p>
              </Card>
            )}

            <Button size="lg" icon={ArrowRight} isLoading={endMutation.isPending} onClick={handleNext} className="w-full">
              {isLastQuestion ? "Finish interview" : "Next question"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
