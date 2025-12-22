// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { lazy, Suspense } from "react";
// import ProtectedRoute from "./components/ProtectedRoute";

// import "./styles/global.css"; 
// import "./App.css";

// import ScheduleUploadPage from './pages/ScheduleUploadPage';

// import Loader from "./components/common/Loader";
// import { AuthProvider } from './context/AuthContext';
// import { ToastProvider } from './context/ToastContext';
// // Lazy loading des composants
// const Landing = lazy(() => import("./components/Landing"));
// const Login = lazy(() => import("./components/Auth/Login"));
// const SignUp = lazy(() => import("./components/Auth/SignUp"));
// const DashboardPage = lazy(() => import("./pages/DashboardPage"));
// const MatiereTasksPage = lazy(() => import("./pages/MatiereTasksPage"));
// const CalendarPage = lazy(() => import("./pages/CalendarPage"));

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <ToastProvider>
//           <Suspense fallback={<Loader fullScreen />}>
//             <Routes>
//               {/* Routes publiques */}
//               <Route path="/" element={<Landing />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/signup" element={<SignUp />} />
              
//               {/* Routes protégées */}
//               <Route
//                 path="/dashboard"
//                 element={
//                   <ProtectedRoute>
//                     <DashboardPage />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/matiere/:matiereId/tasks"
//                 element={
//                   <ProtectedRoute>
//                     <MatiereTasksPage />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route 
//                 path="/calendar" 
//                 element={
//                   <ProtectedRoute>
//                     <CalendarPage />
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/schedule/upload" 
//                 element={
//                   <ProtectedRoute>
//                     <ScheduleUploadPage />
//                   </ProtectedRoute>
//                 } 
//               />
              
//               {/* Redirection par défaut */}
//               <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//           </Suspense>
//         </ToastProvider>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './components/Landing';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import CreateTaskForm from './pages/CreateTaskForm';
import CalendarPage from './pages/CalendarPage';

import './styles/dashboard.css';
import MatiereTasksPage from './pages/MatiereTasksPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/dashboard/matieres" element={<ProtectedRoute><div>Matières</div></ProtectedRoute>} />
            <Route path="/dashboard/taches" element={<ProtectedRoute><div>Tâches</div></ProtectedRoute>} />
            <Route path="/dashboard/planning" element={<ProtectedRoute><div>Planning</div></ProtectedRoute>} />
            <Route path="/dashboard/emploi-temps" element={<ProtectedRoute><div>Emploi du temps</div></ProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute><div>Notifications</div></ProtectedRoute>} />
            <Route path="/dashboard/stats" element={<ProtectedRoute><div>Statistiques</div></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><div>Profil</div></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><div>Paramètres</div></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute><MatiereTasksPage/></ProtectedRoute>} />
            <Route path="/dashboard/CreateTaskForm" element={<ProtectedRoute><CreateTaskForm/></ProtectedRoute>} />
            <Route path="/dashboard/calendarPage" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            
            
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;