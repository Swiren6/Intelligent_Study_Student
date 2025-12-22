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
  Clock3,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success } = useToast();
  
  // États initiaux
  const [stats, setStats] = useState({
    matieres: 7,
    taches: 12,
    tachesCompletees: 8,
    plannings: 2,
    tempsEtudie: 24.5,
    tempsEstime: 40,
    examensProchains: 4,
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

  // Nouvel état pour les examens
  const [upcomingExams, setUpcomingExams] = useState([
    {
      id: 1,
      title: 'Examen Final - Machine Learning',
      matiere: 'Machine Learning',
      date: '2024-06-15',
      time: '09:00',
      duration: '3h',
      type: 'examen',
      importance: 'high',
      location: 'Salle A201',
      professor: 'Dr. Martin',
      color: '#EF4444',
      joursRestants: 14,
    },
    {
      id: 2,
      title: 'Examen Partiel - Base de données',
      matiere: 'Base de données',
      date: '2024-06-08',
      time: '14:00',
      duration: '2h',
      type: 'partiel',
      importance: 'medium',
      location: 'Amphi B',
      professor: 'Prof. Dubois',
      color: '#3B82F6',
      joursRestants: 7,
    },
    {
      id: 3,
      title: 'Quiz - React Avancé',
      matiere: 'React',
      date: '2024-06-03',
      time: '10:30',
      duration: '1h30',
      type: 'quiz',
      importance: 'low',
      location: 'Salle C105',
      professor: 'Mme. Laurent',
      color: '#10B981',
      joursRestants: 2,
    },
    {
      id: 4,
      title: 'Oral - Anglais Technique',
      matiere: 'Anglais',
      date: '2024-06-20',
      time: '16:00',
      duration: '30min',
      type: 'oral',
      importance: 'medium',
      location: 'Bureau 304',
      professor: 'Mr. Smith',
      color: '#8B5CF6',
      joursRestants: 19,
    },
  ]);

  useEffect(() => {
    // Afficher un message de bienvenue
    success(`Bienvenue ${user?.nom || 'étudiant'} ! 👋`);

    // TODO: Charger les vraies données depuis l'API
    // fetchDashboardStats();
    
    // Mettre à jour les jours restants chaque jour
    const updateDaysRemaining = () => {
      setUpcomingExams(prevExams => 
        prevExams.map(exam => ({
          ...exam,
          joursRestants: calculateDaysRemaining(exam.date)
        }))
      );
    };
    
    updateDaysRemaining();
    
    // Mettre à jour à minuit chaque jour
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(() => {
      updateDaysRemaining();
      // Ensuite, mettre à jour toutes les 24h
      setInterval(updateDaysRemaining, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);

  // Fonction pour calculer les jours restants
  const calculateDaysRemaining = (examDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir le type d'examen
  const getExamTypeLabel = (type) => {
    switch(type) {
      case 'examen': return 'Examen Final';
      case 'partiel': return 'Examen Partiel';
      case 'quiz': return 'Quiz';
      case 'oral': return 'Examen Oral';
      default: return 'Examen';
    }
  };

  // Fonction pour obtenir la couleur d'importance
  const getImportanceColor = (importance) => {
    switch(importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewAllExams = () => {
    navigate('/dashboard/calendarPage');
  };

  const handleViewExamDetails = (examId) => {
    navigate(`/dashboard/exams/${examId}`);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`stat-icon-container ${color}`}>
          <Icon className={`stat-icon ${color}`} />
        </div>
        {trend !== undefined && (
          <span className={trend > 0 ? 'trend-positive' : 'trend-negative'}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
      {subtitle && (
        <p className="stat-subtitle">{subtitle}</p>
      )}
    </div>
  );

  const ProgressBar = ({ progress, color }) => (
    <div className="progress-bar-container">
      <div
        className="progress-bar-fill"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'tache':
        return CheckSquare;
      case 'matiere':
        return BookOpen;
      case 'planning':
        return Calendar;
      case 'examen':
        return Award;
      default:
        return TrendingUp;
    }
  };

  return (
    <div className="dashboard-container">
      { <Sidebar />}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p>
            Bienvenue, {user?.nom || 'étudiant'} ! Voici un aperçu de vos études.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
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
            icon={Award}
            title="Examens prochains"
            value={stats.examensProchains}
            subtitle={`${upcomingExams.filter(e => e.joursRestants <= 7).length} dans les 7 jours`}
            color="red"
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

        {/* Three Columns Layout */}
        <div className="three-columns-grid">
          {/* Tâches urgentes */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <AlertCircle className="card-icon text-red-500" />
                Tâches urgentes
              </h2>
              <button 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline" 
                onClick={() => navigate('/dashboard/tasks')}
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-4">
              {urgentTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-header">
                    <div>
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-meta">
                        <span
                          className="task-color-dot"
                          style={{ backgroundColor: task.color }}
                        />
                        <span>{task.matiere}</span>
                        <span>•</span>
                        <span className="text-red-600">
                          Dans {task.deadline}
                        </span>
                      </div>
                    </div>
                    <span className="task-progress">{task.progress}%</span>
                  </div>
                  <ProgressBar progress={task.progress} color={task.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Calendrier des examens */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <CalendarDays className="card-icon text-purple-500" />
                Calendrier des examens
              </h2>
              <button 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={handleViewAllExams}
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-4">
              {upcomingExams
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 4) // Afficher seulement les 4 prochains
                .map((exam) => (
                  <div 
                    key={exam.id} 
                    className="exam-item"
                    onClick={() => handleViewExamDetails(exam.id)}
                  >
                    <div className="exam-header">
                      <div className="exam-date-indicator" style={{ backgroundColor: exam.color }}>
                        <span className="exam-day">{new Date(exam.date).getDate()}</span>
                        <span className="exam-month">
                          {new Date(exam.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                      </div>
                      <div className="exam-info">
                        <h3 className="exam-title">{exam.title}</h3>
                        <div className="exam-meta">
                          <span className="exam-matiere">{exam.matiere}</span>
                          <span className="exam-separator">•</span>
                          <span className="exam-time">{exam.time} • {exam.duration}</span>
                          <span className="exam-separator">•</span>
                          <span className="exam-location">{exam.location}</span>
                        </div>
                      </div>
                      <div className="exam-actions">
                        <span className={`exam-importance ${getImportanceColor(exam.importance)}`}>
                          {exam.importance === 'high' ? 'Haute' : exam.importance === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="exam-footer">
                      <div className="exam-days-left">
                        <AlertTriangle className={`w-4 h-4 ${exam.joursRestants <= 3 ? 'text-red-500' : exam.joursRestants <= 7 ? 'text-yellow-500' : 'text-green-500'}`} />
                        <span className={`font-semibold ${exam.joursRestants <= 3 ? 'text-red-600' : exam.joursRestants <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {exam.joursRestants === 0 ? "Aujourd'hui" : 
                           exam.joursRestants === 1 ? "Demain" : 
                           `Dans ${exam.joursRestants} jours`}
                        </span>
                      </div>
                      <span className="exam-type">{getExamTypeLabel(exam.type)}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Prochain examen */}
            {upcomingExams.length > 0 && (
              <div className="next-exam-highlight">
                <div className="next-exam-header">
                  <h3 className="next-exam-title">Prochain examen</h3>
                  <div className="next-exam-date">
                    {formatDate(upcomingExams[0].date)}
                  </div>
                </div>
                <div className="next-exam-details">
                  <div className="next-exam-info">
                    <h4 className="next-exam-name">{upcomingExams[0].title}</h4>
                    <p className="next-exam-description">
                      {upcomingExams[0].matiere} • {upcomingExams[0].professor}
                    </p>
                    <div className="next-exam-time">
                      <Clock3 className="w-4 h-4" />
                      <span>{upcomingExams[0].time} • {upcomingExams[0].duration}</span>
                    </div>
                  </div>
                  <button 
                    className="next-exam-button"
                    onClick={() => handleViewExamDetails(upcomingExams[0].id)}
                  >
                    Détails
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Activité récente */}
          <div className="card">
            <h2 className="card-title mb-6">
              <TrendingUp className="card-icon text-blue-500" />
              Activité récente
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon-container ${activity.status}`}>
                      <ActivityIcon className={`activity-icon ${activity.status}`} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">{activity.title}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-grid">
          <button 
            className="action-button blue" 
            onClick={() => navigate('/dashboard/CreateTaskForm')}
          >
            <Target className="action-icon" />
            <span>Nouvelle tâche</span>
          </button>
          <button 
            className="action-button green"
            onClick={() => navigate('/dashboard/plannings/new')}
          >
            <Calendar className="action-icon" />
            <span>Créer planning</span>
          </button>
          <button 
            className="action-button purple"
            onClick={() => navigate('/dashboard/subjects/new')}
          >
            <BookOpen className="action-icon" />
            <span>Ajouter matière</span>
          </button>
        </div>
      </main>
    </div>
  );
};


export default DashboardPage;
