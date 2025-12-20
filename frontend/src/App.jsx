import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ScheduleUploadPage from './pages/ScheduleUploadPage';

import Loader from "./components/common/Loader";

const Landing = lazy(() => import("./components/Landing"));
const Login = lazy(() => import("./components/Auth/Login"));
const SignUp = lazy(() => import("./components/Auth/SignUp"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MatiereTasksPage = lazy(() => import("./pages/MatiereTasksPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<Loader fullScreen />}>
            <Routes>
              <Route path="/Dashboard" element={<DashboardPage />} />
              <Route path="/matiere" element={<MatiereTasksPage />} /> 
              <Route path="/calender" element={<CalendarPage />} />
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/schedule/upload" element={<ScheduleUploadPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matiere/:matiereId/tasks"
                element={
                  <ProtectedRoute>
                    <MatiereTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;