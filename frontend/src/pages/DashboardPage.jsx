import { useState, useEffect, useRef } from 'react';
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
  Home,
  BarChart3,
  Users,
  Settings,
  Bell,
  ChevronRight,
  Menu,
  X,
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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressAnimations, setProgressAnimations] = useState({});

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'tache',
      title: 'TP Machine Learning terminé',
      time: 'Il y a 2 heures',
      status: 'completed',
      icon: CheckSquare,
    },
    {
      id: 2,
      type: 'matiere',
      title: 'Nouvelle matière ajoutée: React',
      time: 'Il y a 5 heures',
      status: 'new',
      icon: BookOpen,
    },
    {
      id: 3,
      type: 'planning',
      title: 'Planning de la semaine généré',
      time: 'Hier',
      status: 'info',
      icon: Calendar,
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Certification Python obtenue',
      time: 'Il y a 3 jours',
      status: 'completed',
      icon: Award,
    },
  ]);

  const [urgentTasks, setUrgentTasks] = useState([
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
    // Afficher un message de bienvenue
    success(`Bienvenue ${user?.nom || 'étudiant'} ! 👋`);

    // Simulation de chargement
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Animer les barres de progression
      urgentTasks.forEach((task, index) => {
        setTimeout(() => {
          animateProgress(task.id, task.targetProgress);
        }, 300 * (index + 1));
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const animateProgress = (taskId, targetProgress) => {
    let currentProgress = 0;
    const step = targetProgress / 20;
    const interval = setInterval(() => {
      currentProgress += step;
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
        clearInterval(interval);
      }
      setProgressAnimations(prev => ({
        ...prev,
        [taskId]: currentProgress
      }));
    }, 30);
  };

  const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = 'blue', 
  trend = null,
  delay = 0,
  percentage = null,
  loading = false 
}) => {
  // Définir les couleurs pour chaque type
  const colorMap = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-500/20',
      gradient: 'from-blue-400/20 to-blue-600/20'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      ring: 'ring-green-500/20',
      gradient: 'from-green-400/20 to-green-600/20'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      ring: 'ring-purple-500/20',
      gradient: 'from-purple-400/20 to-purple-600/20'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      ring: 'ring-orange-500/20',
      gradient: 'from-orange-400/20 to-orange-600/20'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500/20',
      gradient: 'from-red-400/20 to-red-600/20'
    }
  };

  const colors = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <div className="stat-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="skeleton w-12 h-12 rounded-xl mb-4"></div>
        <div className="skeleton w-3/4 h-8 rounded mb-2"></div>
        <div className="skeleton w-1/2 h-4 rounded"></div>
      </div>
    );
  }

  return (
    <div 
      className="stat-card group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient background effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-2 group-hover:ring-opacity-50 group-hover:scale-[1.02] transition-all duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          {/* Icon with gradient background */}
          <div className={`relative ${colors.light} rounded-2xl p-3 transform group-hover:scale-110 transition-all duration-300`}>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <Icon className={`w-7 h-7 ${colors.icon} relative z-10`} />
            
            {/* Floating particles effect */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Trend indicator */}
          {trend !== null && (
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
              trend > 0 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            } transition-all duration-300 group-hover:scale-105`}>
              {trend > 0 ? (
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className="font-bold text-sm">
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>

        {/* Value with counter animation */}
        <div className="mb-2">
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight group-hover:scale-105 transition-transform duration-300 inline-block">
              {value}
            </h3>
            {percentage !== null && (
              <div className="relative mb-1">
                <div className={`text-sm font-bold px-2 py-1 rounded-full ${colors.light} ${colors.icon} transition-all duration-300 group-hover:scale-110`}>
                  {percentage}%
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
            )}
          </div>
        </div>

        {/* Title with animated underline */}
        <div className="relative">
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 inline-block">
            {title}
          </p>
          <div className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r ${colors.bg} group-hover:w-full transition-all duration-500`}></div>
        </div>

        {/* Subtitle with icon */}
        {subtitle && (
          <div className="flex items-center mt-3 space-x-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            <svg className={`w-4 h-4 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          </div>
        )}

        {/* Progress bar for percentage cards */}
        {percentage !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progression</span>
              <span className="font-semibold">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out"
                style={{
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${colors.bg.replace('from-', '').replace('to-', '').split(' ')[0]}, ${colors.bg.split(' ')[1]})`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Interactive button for actions */}
        <button className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Utilisation améliorée dans le dashboard :
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <StatCard
    icon={BookOpen}
    title="Matières actives"
    value="07"
    subtitle="7 matières ce semestre"
    color="blue"
    trend={12}
    delay={100}
  />
  <StatCard
    icon={CheckSquare}
    title="Tâches en cours"
    value={`${stats.tachesCompletees}/${stats.taches}`}
    subtitle="Dernière tâche: il y a 2h"
    color="green"
    trend={8}
    percentage={Math.round((stats.tachesCompletees / stats.taches) * 100)}
    delay={200}
  />
  <StatCard
    icon={Calendar}
    title="Plannings actifs"
    value="02"
    subtitle="2 plannings cette semaine"
    color="purple"
    delay={300}
  />
  <StatCard
    icon={Clock}
    title="Temps d'étude"
    value={`${stats.tempsEtudie}h`}
    subtitle={`${stats.tempsEstime}h estimées`}
    color="orange"
    trend={-5}
    delay={400}
  />
</div>

  const ProgressBar = ({ progress, color, taskId }) => {
    const currentProgress = progressAnimations[taskId] || progress;
    
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="progress-bar h-2 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${currentProgress}%`,
            backgroundColor: color,
          }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`sidebar fixed lg:relative inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 transition-all duration-300">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Tableau de bord
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Bon retour, <span className="font-semibold gradient-text">{user?.nom || 'étudiant'}</span> !
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all relative notification-dot">
                <Bell className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.nom?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.nom || 'Étudiant'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Étudiant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatCard
              icon={BookOpen}
              title="Matières actives"
              value={stats.matieres}
              subtitle="7 matières ce semestre"
              color="blue"
              trend={12}
              delay={100}
            />
            <StatCard
              icon={CheckSquare}
              title="Tâches en cours"
              value={`${stats.tachesCompletees}/${stats.taches}`}
              subtitle={`${Math.round((stats.tachesCompletees / stats.taches) * 100)}% complétées`}
              color="green"
              trend={8}
              delay={200}
            />
            <StatCard
              icon={Calendar}
              title="Plannings actifs"
              value={stats.plannings}
              subtitle="2 plannings cette semaine"
              color="purple"
              delay={300}
            />
            <StatCard
              icon={Clock}
              title="Temps d'étude"
              value={`${stats.tempsEtudie}h`}
              subtitle={`${stats.tempsEstime}h estimées`}
              color="orange"
              trend={-5}
              delay={400}
            />
          </div>
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          {/* Tâches urgentes */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm card-hover">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <div className="relative">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                Tâches urgentes
              </h2>
              <button className="btn-gradient text-sm text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                Voir tout <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                    task.priority === 'high' 
                      ? 'priority-high border-red-200 dark:border-red-800' 
                      : task.priority === 'medium'
                      ? 'priority-medium border-yellow-200 dark:border-yellow-800'
                      : 'priority-low border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: task.color }}
                        />
                        <span>{task.matiere}</span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          task.deadline.includes('2 jours') 
                            ? 'text-red-600 dark:text-red-400'
                            : task.deadline.includes('5 jours')
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          Dans {task.deadline}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-4">
                      {Math.round(progressAnimations[task.id] || task.progress)}%
                    </span>
                  </div>
                  <ProgressBar progress={task.progress} color={task.color} taskId={task.id} />
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm card-hover">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mr-2 animate-bounce" />
              Activité récente
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:translate-x-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${activity.status === 'completed' ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' : ''}
                    ${activity.status === 'new' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30' : ''}
                    ${activity.status === 'info' ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30' : ''}
                    transition-all duration-300 hover:scale-110
                  `}>
                    {activity.icon && <activity.icon className={`
                      w-5 h-5
                      ${activity.status === 'completed' ? 'text-green-600 dark:text-green-400' : ''}
                      ${activity.status === 'new' ? 'text-blue-600 dark:text-blue-400' : ''}
                      ${activity.status === 'info' ? 'text-purple-600 dark:text-purple-400' : ''}
                    `} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
          <button className="btn-gradient p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.02]">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Nouvelle tâche</span>
          </button>
          <button className="btn-gradient p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.02]">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Créer planning</span>
          </button>
          <button className="btn-gradient p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.02]">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">Ajouter matière</span>
          </button>
        </div>

        {/* Performance Section */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Award className="w-5 h-5 text-yellow-500 mr-2" />
              Performance académique
            </h2>
            <span className="text-sm font-semibold text-green-600">+15% vs dernier mois</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">87%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux réussite</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">3.8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Moyenne GPA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">24/30</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Top 10%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Classement</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;