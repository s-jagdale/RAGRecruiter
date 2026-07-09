import { useContext } from "react";
import { InterviewSessionContext } from "../context/InterviewSessionContext";

export function useInterviewSession() {
  const context = useContext(InterviewSessionContext);
  if (!context) {
    throw new Error("useInterviewSession must be used within an InterviewSessionProvider");
  }
  return context;
}
