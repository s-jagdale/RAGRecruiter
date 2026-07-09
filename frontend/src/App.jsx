import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { InterviewSessionProvider } from "./context/InterviewSessionContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import { ROUTES } from "./constants";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TrackSelectionPage from "./pages/TrackSelectionPage";
import InterviewSetupPage from "./pages/InterviewSetupPage";
import InterviewScreenPage from "./pages/InterviewScreenPage";
import InterviewResultPage from "./pages/InterviewResultPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <InterviewSessionProvider>
            <BrowserRouter>
              <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
              <Routes>
                <Route element={<MainLayout />}>
                  {/* Public */}
                  <Route path={ROUTES.HOME} element={<LandingPage />} />
                  <Route path={ROUTES.ABOUT} element={<AboutPage />} />

                  {/* Guest-or-auth interview flow — /start-session and /upload-resume
                      both support optional auth (get_optional_user on the backend) */}
                  <Route path={ROUTES.TRACK_SELECTION} element={<TrackSelectionPage />} />
                  <Route path={ROUTES.INTERVIEW_SETUP} element={<InterviewSetupPage />} />
                  <Route path={ROUTES.INTERVIEW_SCREEN} element={<InterviewScreenPage />} />
                  <Route path={ROUTES.INTERVIEW_RESULT} element={<InterviewResultPage />} />

                  {/* Requires auth */}
                  <Route element={<ProtectedRoute />}>
                    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                    <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
                    <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                    <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                    <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                  </Route>
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                  <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </InterviewSessionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
