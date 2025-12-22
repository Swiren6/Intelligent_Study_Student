import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Dashboard/Sidebar';
import {
  BookOpen,
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Award,
  Target,
} from 'lucide-react';

const DashboardPage = () => {
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

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'tache',
      title: 'TP Machine Learning terminé',
      time: 'Il y a 2 heures',
      status: 'completed',
    },
    {
      id: 2,
      type: 'matiere',
      title: 'Nouvelle matière ajoutée: React',
      time: 'Il y a 5 heures',
      status: 'new',
    },
    {
      id: 3,
      type: 'planning',
      title: 'Planning de la semaine généré',
      time: 'Hier',
      status: 'info',
    },
  ]);

  const [urgentTasks, setUrgentTasks] = useState([
    {
      id: 1,
      title: 'Projet Django REST API',
      matiere: 'Django',
      deadline: '2 jours',
      progress: 35,
      color: '#F59E0B',
    },
    {
      id: 2,
      title: 'Révision ML/DL chapitres 1-3',
      matiere: 'Machine Learning',
      deadline: '5 jours',
      progress: 65,
      color: '#8B5CF6',
    },
    {
      id: 3,
      title: 'Projet React Dashboard',
      matiere: 'React',
      deadline: '7 jours',
      progress: 50,
      color: '#61DAFB',
    },
  ]);

  useEffect(() => {
    // Afficher un message de bienvenue
    success(`Bienvenue ${user?.nom || 'étudiant'} ! 👋`);

    // TODO: Charger les vraies données depuis l'API
    // fetchDashboardStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );

  const ProgressBar = ({ progress, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* <Sidebar /> */}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenue, {user?.nom || 'étudiant'} ! Voici un aperçu de vos études.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Matières actives"
            value={stats.matieres}
            subtitle="7 matières ce semestre"
            color="blue"
            trend={12}
          />
          <StatCard
            icon={CheckSquare}
            title="Tâches en cours"
            value={`${stats.tachesCompletees}/${stats.taches}`}
            subtitle={`${Math.round((stats.tachesCompletees / stats.taches) * 100)}% complétées`}
            color="green"
            trend={8}
          />
          <StatCard
            icon={Calendar}
            title="Plannings actifs"
            value={stats.plannings}
            subtitle="2 plannings cette semaine"
            color="purple"
          />
          <StatCard
            icon={Clock}
            title="Temps d'étude"
            value={`${stats.tempsEtudie}h`}
            subtitle={`${stats.tempsEstime}h estimées`}
            color="orange"
            trend={-5}
          />
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tâches urgentes */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                Tâches urgentes
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Voir tout
              </button>
            </div>

            <div className="space-y-4">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.color }}
                        />
                        <span>{task.matiere}</span>
                        <span>•</span>
                        <span className="text-red-600 dark:text-red-400">
                          Dans {task.deadline}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {task.progress}%
                    </span>
                  </div>
                  <ProgressBar progress={task.progress} color={task.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
              Activité récente
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${activity.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' : ''}
                    ${activity.status === 'new' ? 'bg-blue-100 dark:bg-blue-900/20' : ''}
                    ${activity.status === 'info' ? 'bg-purple-100 dark:bg-purple-900/20' : ''}
                  `}>
                    {activity.type === 'tache' && <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {activity.type === 'matiere' && <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    {activity.type === 'planning' && <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Nouvelle tâche</span>
          </button>
          <button className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Créer planning</span>
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">Ajouter matière</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;