import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import '../styles/dashboard.css';
import {
  BookOpen,
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Award,
  Target,
  ChevronRight,
  Bell,
  Menu,
  X,
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success } = useToast();

  const [stats, setStats] = useState({
    matieres: 7,
    taches: 12,
    tachesCompletees: 8,
    plannings: 2,
    tempsEtudie: 24.5,
    tempsEstime: 40,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressAnimations, setProgressAnimations] = useState({});

  const [recentActivities] = useState([
    {
      id: 1,
      title: 'TP Machine Learning terminé',
      time: 'Il y a 2 heures',
      status: 'completed',
      icon: CheckSquare,
    },
    {
      id: 2,
      title: 'Nouvelle matière ajoutée: React',
      time: 'Il y a 5 heures',
      status: 'new',
      icon: BookOpen,
    },
    {
      id: 3,
      title: 'Planning de la semaine généré',
      time: 'Hier',
      status: 'info',
      icon: Calendar,
    },
    {
      id: 4,
      title: 'Certification Python obtenue',
      time: 'Il y a 3 jours',
      status: 'completed',
      icon: Award,
    },
  ]);

  const [urgentTasks] = useState([
    {
      id: 1,
      title: 'Projet Django REST API',
      matiere: 'Django',
      deadline: '2 jours',
      progress: 0,
      targetProgress: 35,
      color: '#F59E0B',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Révision ML/DL chapitres 1-3',
      matiere: 'Machine Learning',
      deadline: '5 jours',
      progress: 0,
      targetProgress: 65,
      color: '#8B5CF6',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Projet React Dashboard',
      matiere: 'React',
      deadline: '7 jours',
      progress: 0,
      targetProgress: 50,
      color: '#61DAFB',
      priority: 'low',
    },
  ]);

  useEffect(() => {
    success(`Bienvenue ${user?.nom || 'étudiant'} ! 👋`);

    const timer = setTimeout(() => {
      setLoading(false);
      urgentTasks.forEach((task, index) => {
        setTimeout(() => {
          animateProgress(task.id, task.targetProgress);
        }, 300 * (index + 1));
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const animateProgress = (taskId, target) => {
    let current = 0;
    const step = target / 20;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setProgressAnimations((prev) => ({ ...prev, [taskId]: current }));
    }, 30);
  };

  const ProgressBar = ({ taskId, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{
          width: `${Math.round(progressAnimations[taskId] || 0)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Chargement du dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`fixed lg:relative z-50 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <X /> : <Menu />}
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de bord
              </h1>
              <p className="text-gray-500">
                Bon retour, <b>{user?.nom || 'étudiant'}</b>
              </p>
            </div>
          </div>
          <Bell className="w-5 h-5 text-gray-600" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Stat label="Matières" value={stats.matieres} icon={BookOpen} />
          <Stat label="Tâches" value={`${stats.tachesCompletees}/${stats.taches}`} icon={CheckSquare} />
          <Stat label="Plannings" value={stats.plannings} icon={Calendar} />
          <Stat label="Temps d'étude" value={`${stats.tempsEtudie}h`} icon={Clock} />
        </div>

        {/* Urgent tasks */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertCircle className="text-red-500 mr-2" /> Tâches urgentes
          </h2>

          <div className="space-y-4">
            {urgentTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <span>{Math.round(progressAnimations[task.id] || 0)}%</span>
                </div>
                <ProgressBar taskId={task.id} color={task.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Action icon={Target} label="Nouvelle tâche" />
          <Action icon={Calendar} label="Créer planning" />
          <Action icon={BookOpen} label="Ajouter matière" />
        </div>
      </main>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
    <Icon className="mb-2 text-blue-500" />
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const Action = ({ icon: Icon, label }) => (
  <button className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center gap-2">
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default DashboardPage;