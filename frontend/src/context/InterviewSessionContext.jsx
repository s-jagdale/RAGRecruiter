import { createContext, useCallback, useState } from "react";

export const InterviewSessionContext = createContext(null);

const initialState = {
  track: null,
  resumeText: "",
  resumeFilename: "",
  jobRole: "",
  jobDescription: "",
  sessionId: null,
  questions: [],
  focusAreas: [],
  identifiedSkills: [],
  currentIndex: 0,
  answeredLog: [], // [{question, answer, ...scoreFields}]
  summary: null, // set once /end-session resolves
};

export function InterviewSessionProvider({ children }) {
  const [session, setSession] = useState(initialState);

  const setTrack = useCallback((track) => {
    setSession((prev) => ({ ...prev, track }));
  }, []);

  const setResume = useCallback((resumeText, resumeFilename) => {
    setSession((prev) => ({ ...prev, resumeText, resumeFilename }));
  }, []);

  const setSetupDetails = useCallback((jobRole, jobDescription) => {
    setSession((prev) => ({ ...prev, jobRole, jobDescription }));
  }, []);

  const startSessionState = useCallback((data) => {
    setSession((prev) => ({
      ...prev,
      sessionId: data.session_id,
      questions: data.questions,
      focusAreas: data.focus_areas,
      identifiedSkills: data.identified_skills,
      currentIndex: 0,
      answeredLog: [],
      summary: null,
    }));
  }, []);

  const recordAnswer = useCallback((question, answer, scoreResult) => {
    setSession((prev) => ({
      ...prev,
      answeredLog: [...prev.answeredLog, { question, answer, ...scoreResult }],
      currentIndex: prev.currentIndex + 1,
    }));
  }, []);

  const setSummary = useCallback((summary) => {
    setSession((prev) => ({ ...prev, summary }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(initialState);
  }, []);

  return (
    <InterviewSessionContext.Provider
      value={{
        session,
        setTrack,
        setResume,
        setSetupDetails,
        startSessionState,
        recordAnswer,
        setSummary,
        resetSession,
      }}
    >
      {children}
    </InterviewSessionContext.Provider>
  );
}
