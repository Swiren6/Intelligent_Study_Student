import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, Calendar, Clock, CheckCircle, 
  AlertCircle, Trash2, Edit, Download, RefreshCw,
  Eye, EyeOff, Filter, Search
} from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import PDFUploader from '../components/Schedule/PDFUploader';
import CoursesList from '../components/Schedule/CoursesList';
import FreeSlotsList from '../components/Schedule/FreeSlotsList';
import { useAPI } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import API_CONFIG from '../config/api.config';
import '../styles/ScheduleUpload.css';

export default function ScheduleUploadPage() {
  const navigate = useNavigate();
  const api = useAPI();
  const { showSuccess, showError, showInfo } = useToast();

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [view, setView] = useState('upload'); // 'upload', 'courses', 'freeslots'
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const result = await api.get(API_CONFIG.ENDPOINTS.SCHEDULES.BY_USER);
      if (result.success) {
        const schedulesList = result.data.emplois_du_temps || result.data;
        setSchedules(schedulesList);
        
        // Sélectionner automatiquement le plus récent
        if (schedulesList.length > 0) {
          const mostRecent = schedulesList[0];
          setSelectedSchedule(mostRecent);
          if (mostRecent.analyse_completee) {
            await loadScheduleDetails(mostRecent.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      showError('Erreur lors du chargement des emplois du temps');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleDetails = async (scheduleId) => {
    try {
      // Charger les cours
      const coursesResult = await api.get(
        `${API_CONFIG.ENDPOINTS.SCHEDULES.BY_ID(scheduleId)}/cours`
      );
      if (coursesResult.success) {
        setCourses(coursesResult.data.cours || coursesResult.data);
      }

      // Charger les créneaux libres
      const slotsResult = await api.get(
        `/api/services/creneaux-libres/${scheduleId}`
      );
      if (slotsResult.success) {
        setFreeSlots(slotsResult.data);
      }
    } catch (error) {
      console.error('Error loading schedule details:', error);
    }
  };

  const handleUploadComplete = async (uploadedSchedule) => {
    setShowUploadModal(false);
    showSuccess('PDF uploadé avec succès!');
    
    // Ajouter à la liste
    setSchedules([uploadedSchedule, ...schedules]);
    setSelectedSchedule(uploadedSchedule);
    
    // Lancer l'analyse automatiquement
    await handleAnalyzeSchedule(uploadedSchedule.id);
  };

  const handleAnalyzeSchedule = async (scheduleId) => {
    setAnalyzing(true);
    showInfo('Analyse en cours... Cela peut prendre quelques secondes.');
    
    try {
      const result = await api.post(
        `/api/services/analyser-pdf/${scheduleId}`
      );
      
      if (result.success) {
        showSuccess(`Analyse terminée! ${result.data.cours_extraits} cours extraits.`);
        
        // Mettre à jour l'emploi du temps
        const updatedSchedule = result.data.emploi_du_temps;
        setSchedules(schedules.map(s => 
          s.id === scheduleId ? updatedSchedule : s
        ));
        setSelectedSchedule(updatedSchedule);
        
        // Charger les détails
        await loadScheduleDetails(scheduleId);
        setView('courses');
      } else {
        showError('Erreur lors de l\'analyse du PDF');
      }
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      showError('Erreur lors de l\'analyse du PDF');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet emploi du temps ?')) {
      return;
    }

    try {
      const result = await api.del(API_CONFIG.ENDPOINTS.SCHEDULES.DELETE(scheduleId));
      
      if (result.success) {
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        if (selectedSchedule?.id === scheduleId) {
          setSelectedSchedule(null);
          setCourses([]);
          setFreeSlots([]);
        }
        showSuccess('Emploi du temps supprimé');
      }
    } catch (error) {
      showError('Erreur lors de la suppression');
    }
  };

  const handleUpdateCourse = async (courseId, updates) => {
    try {
      const result = await api.put(
        `/api/pdf/cours/${courseId}`,
        updates
      );
      
      if (result.success) {
        setCourses(courses.map(c => 
          c.id === courseId ? result.data : c
        ));
        showSuccess('Cours mis à jour');
      }
    } catch (error) {
      showError('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      const result = await api.del(`/api/pdf/cours/${courseId}`);
      
      if (result.success) {
        setCourses(courses.filter(c => c.id !== courseId));
        showSuccess('Cours supprimé');
      }
    } catch (error) {
      showError('Erreur lors de la suppression');
    }
  };

  const getScheduleStats = () => {
    if (!selectedSchedule) return null;

    const totalHours = courses.reduce((sum, course) => {
      return sum + (course.duree_minutes || 0) / 60;
    }, 0);

    const uniqueDays = [...new Set(courses.map(c => c.jour))];

    return {
      totalCourses: courses.length,
      totalHours: totalHours.toFixed(1),
      uniqueDays: uniqueDays.length,
      freeSlots: freeSlots.length,
      confidence: selectedSchedule.confiance_extraction || 0
    };
  };

  const stats = getScheduleStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="schedule-upload-page">
      <Navbar />

      <main className="schedule-main">
        {/* Header */}
        <div className="schedule-header">
          <div>
            <h1 className="schedule-title">📚 Emploi du Temps</h1>
            <p className="schedule-subtitle">
              Importez votre emploi du temps PDF pour une analyse automatique
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="upload-btn"
          >
            <Upload className="w-5 h-5" />
            <span>Importer un PDF</span>
          </button>
        </div>

        {/* Statistiques */}
        {selectedSchedule && stats && (
          <div className="stats-grid">
            <StatCard
              icon={FileText}
              label="Cours extraits"
              value={stats.totalCourses}
              color="blue"
            />
            <StatCard
              icon={Clock}
              label="Heures de cours"
              value={`${stats.totalHours}h`}
              color="green"
            />
            <StatCard
              icon={Calendar}
              label="Jours de cours"
              value={stats.uniqueDays}
              color="purple"
            />
            <StatCard
              icon={CheckCircle}
              label="Confiance"
              value={`${stats.confidence}%`}
              color="orange"
            />
          </div>
        )}

        <div className="schedule-content">
          {/* Sidebar - Liste des emplois du temps */}
          <aside className="schedule-sidebar">
            <h2 className="sidebar-title">Mes emplois du temps</h2>
            
            {schedules.length === 0 ? (
              <div className="empty-schedules">
                <Upload className="empty-icon" />
                <p className="empty-text">Aucun emploi du temps</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="upload-btn-small"
                >
                  Importer un PDF
                </button>
              </div>
            ) : (
              <div className="schedules-list">
                {schedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    isSelected={selectedSchedule?.id === schedule.id}
                    onSelect={async () => {
                      setSelectedSchedule(schedule);
                      if (schedule.analyse_completee) {
                        await loadScheduleDetails(schedule.id);
                        setView('courses');
                      } else {
                        setView('upload');
                      }
                    }}
                    onAnalyze={handleAnalyzeSchedule}
                    onDelete={handleDeleteSchedule}
                    analyzing={analyzing && selectedSchedule?.id === schedule.id}
                  />
                ))}
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="schedule-main-content">
            {!selectedSchedule ? (
              <EmptyState onUpload={() => setShowUploadModal(true)} />
            ) : !selectedSchedule.analyse_completee ? (
              <AnalysisRequired
                schedule={selectedSchedule}
                onAnalyze={handleAnalyzeSchedule}
                analyzing={analyzing}
              />
            ) : (
              <>
                {/* Tabs */}
                <div className="view-tabs">
                  <button
                    onClick={() => setView('courses')}
                    className={`view-tab ${view === 'courses' ? 'active' : ''}`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cours ({courses.length})</span>
                  </button>
                  <button
                    onClick={() => setView('freeslots')}
                    className={`view-tab ${view === 'freeslots' ? 'active' : ''}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Créneaux libres ({freeSlots.length})</span>
                  </button>
                </div>

                {/* Content */}
                <div className="view-content">
                  {view === 'courses' && (
                    <CoursesList
                      courses={courses}
                      onUpdate={handleUpdateCourse}
                      onDelete={handleDeleteCourse}
                    />
                  )}
                  
                  {view === 'freeslots' && (
                    <FreeSlotsList
                      freeSlots={freeSlots}
                      onGeneratePlanning={() => navigate('/planning/generate')}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal Upload */}
      {showUploadModal && (
        <PDFUploader
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}


function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'stat-blue',
    green: 'stat-green',
    purple: 'stat-purple',
    orange: 'stat-orange'
  };

  return (
    <div className={`stat-card ${colors[color]}`}>
      <Icon className="stat-card-icon" />
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
}

function ScheduleCard({ schedule, isSelected, onSelect, onAnalyze, onDelete, analyzing }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`schedule-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="schedule-card-header">
        <FileText className="schedule-card-icon" />
        <div className="flex-1 min-w-0">
          <h3 className="schedule-card-title">{schedule.nom_fichier}</h3>
          <p className="schedule-card-date">
            Importé le {formatDate(schedule.date_import)}
          </p>
        </div>
      </div>

      {schedule.analyse_completee ? (
        <div className="schedule-card-stats">
          <div className="stat-item">
            <span className="stat-value">{schedule.nombre_cours_extraits}</span>
            <span className="stat-label">cours</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{schedule.confiance_extraction}%</span>
            <span className="stat-label">confiance</span>
          </div>
        </div>
      ) : (
        <div className="schedule-card-warning">
          <AlertCircle className="w-4 h-4" />
          <span>Non analysé</span>
        </div>
      )}

      <div className="schedule-card-actions">
        {!schedule.analyse_completee && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(schedule.id);
            }}
            disabled={analyzing}
            className="action-btn analyze-btn"
            title="Analyser"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(schedule.id);
          }}
          className="action-btn delete-btn"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onUpload }) {
  return (
    <div className="empty-state">
      <Upload className="empty-state-icon" />
      <h3 className="empty-state-title">Aucun emploi du temps sélectionné</h3>
      <p className="empty-state-description">
        Importez votre emploi du temps au format PDF pour commencer l'analyse automatique
      </p>
      <button onClick={onUpload} className="upload-btn">
        <Upload className="w-5 h-5" />
        <span>Importer un PDF</span>
      </button>
    </div>
  );
}

function AnalysisRequired({ schedule, onAnalyze, analyzing }) {
  return (
    <div className="analysis-required">
      <div className="analysis-icon-wrapper">
        <FileText className="analysis-icon" />
      </div>
      <h3 className="analysis-title">PDF importé avec succès!</h3>
      <p className="analysis-description">
        Votre emploi du temps <strong>{schedule.nom_fichier}</strong> est prêt à être analysé.
        L'analyse automatique va extraire tous vos cours et détecter vos créneaux libres.
      </p>
      
      <div className="analysis-features">
        <div className="feature-item">
          <CheckCircle className="feature-icon" />
          <span>Extraction automatique des cours</span>
        </div>
        <div className="feature-item">
          <CheckCircle className="feature-icon" />
          <span>Détection des horaires et salles</span>
        </div>
        <div className="feature-item">
          <CheckCircle className="feature-icon" />
          <span>Identification des créneaux libres</span>
        </div>
      </div>

      <button
        onClick={() => onAnalyze(schedule.id)}
        disabled={analyzing}
        className="analyze-btn-large"
      >
        {analyzing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Analyse en cours...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            <span>Lancer l'analyse</span>
          </>
        )}
      </button>
    </div>
  );
}