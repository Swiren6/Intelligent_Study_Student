import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Clock, AlertCircle, CheckCircle, BookOpen, Filter, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, isBefore, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from '../components/Dashboard/Navbar';
import "../styles/calendar.css";
import Sidebar from '../components/Dashboard/Sidebar';

// Mock API - À remplacer par votre vraie API
const api = {
  get: async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint === '/examens') {
      return { data: [] };
    }
    
    if (endpoint === '/matieres') {
      return { 
        data: [
          { id: 1, nom: 'Mathématiques' },
          { id: 2, nom: 'Physique' },
          { id: 3, nom: 'Chimie' },
          { id: 4, nom: 'Informatique' },
          { id: 5, nom: 'Français' },
          { id: 6, nom: 'Anglais' },
        ]
      };
    }
    
    return { data: [] };
  },
  
  post: async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('POST', endpoint, data);
    return { data: { ...data, id: Date.now() } };
  },
  
  put: async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('PUT', endpoint, data);
    return { data };
  },
  
  delete: async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('DELETE', endpoint);
    return { data: {} };
  }
};

export default function ExamCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [examens, setExamens] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('calendar');
  const [filterMatiere, setFilterMatiere] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examensRes, matieresRes] = await Promise.all([
        api.get('/examens'),
        api.get('/matieres')
      ]);
      setExamens(examensRes.data);
      setMatieres(matieresRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = (date = null) => {
    setSelectedDate(date);
    setEditingExam(null);
    setShowModal(true);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setShowModal(true);
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      try {
        await api.delete(`/examens/${id}`);
        setExamens(examens.filter(e => e.id !== id));
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSaveExam = async (formData) => {
    try {
      let savedExam;
      if (editingExam) {
        savedExam = await api.put(`/examens/${editingExam.id}`, formData);
        setExamens(examens.map(e => e.id === editingExam.id ? { ...savedExam.data, matiere_nom: formData.matiere } : e));
      } else {
        savedExam = await api.post('/examens', formData);
        setExamens([...examens, { ...savedExam.data, matiere_nom: formData.matiere }]);
      }
      return true;
    } catch (error) {
      console.error('Error saving exam:', error);
      throw error;
    }
  };

  const handleExportCalendar = async () => {
    if (examens.length === 0) {
      alert('Aucun examen à exporter !');
      return;
    }

    setExportLoading(true);
    try {
      // Générer le contenu CSV
      const csvContent = generateCSV();
      
      // Générer le contenu ICS (format calendrier)
      const icsContent = generateICS();
      
      // Télécharger les deux formats
      downloadFile(csvContent, 'examens.csv', 'text/csv');
      downloadFile(icsContent, 'calendrier_examens.ics', 'text/calendar');
      
      alert('Calendrier exporté avec succès ! Fichiers CSV et ICS téléchargés.');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du calendrier');
    } finally {
      setExportLoading(false);
    }
  };

  const generateCSV = () => {
    const headers = ['Matière', 'Date', 'Heure', 'Durée', 'Type', 'Salle', 'Coefficient', 'Description'];
    const rows = examens.map(exam => [
      `"${exam.matiere_nom || ''}"`,
      `"${format(new Date(exam.date), 'dd/MM/yyyy')}"`,
      `"${exam.heure || ''}"`,
      `"${exam.duree || ''}"`,
      `"${exam.type_examen || ''}"`,
      `"${exam.salle || ''}"`,
      `"${exam.coefficient || ''}"`,
      `"${exam.description || ''}"`
    ]);
    
    return [headers.join(','), ...rows].join('\n');
  };

  const generateICS = () => {
    const events = examens.map(exam => {
      const startDate = new Date(exam.date);
      const [hours, minutes] = exam.heure.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes));
      
      const endDate = new Date(startDate);
      if (exam.duree) {
        endDate.setHours(endDate.getHours() + parseFloat(exam.duree));
      } else {
        endDate.setHours(endDate.getHours() + 2); // Durée par défaut de 2 heures
      }
      
      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      return [
        'BEGIN:VEVENT',
        `UID:${exam.id}@examcalendar`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:Examen ${exam.matiere_nom}`,
        `DESCRIPTION:${exam.description || 'Examen'}\\nType: ${exam.type_examen || 'Partiel'}\\nSalle: ${exam.salle || 'Non spécifiée'}\\nCoefficient: ${exam.coefficient || '1'}`,
        `LOCATION:${exam.salle || ''}`,
        'END:VEVENT'
      ].join('\n');
    }).join('\n');
    
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ExamCalendar//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Calendrier des Examens',
      'X-WR-TIMEZONE:Europe/Paris',
      events,
      'END:VCALENDAR'
    ].join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getUpcomingExams = () => {
    const today = new Date();
    return examens
      .filter(exam => !isBefore(new Date(exam.date), today))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const getExamStats = () => {
    const today = new Date();
    const upcoming = examens.filter(exam => !isBefore(new Date(exam.date), today));
    const passed = examens.filter(exam => isBefore(new Date(exam.date), today));
    const thisWeek = examens.filter(exam => {
      const diff = differenceInDays(new Date(exam.date), today);
      return diff >= 0 && diff <= 7;
    });
    
    return {
      total: examens.length,
      upcoming: upcoming.length,
      passed: passed.length,
      thisWeek: thisWeek.length
    };
  };

  // Pour le filtre, on utilise maintenant le nom de la matière directement
  const filteredExamens = filterMatiere === 'all' 
    ? examens 
    : examens.filter(e => e.matiere_nom === filterMatiere);

  const stats = getExamStats();

  // Récupérer les noms uniques des matières pour le filtre
  const uniqueMatieres = [...new Set(examens.map(exam => exam.matiere_nom))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (

    
    <div className="min-h-screen bg-gray-50">
      <Navbar></Navbar>
      <Sidebar></Sidebar>
      

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendrier d'Examens</h1>
            <p className="text-gray-600 mt-1">Planifiez et suivez vos examens</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              {view === 'calendar' ? (
                <>
                  <BookOpen className="w-5 h-5" />
                  <span>Vue liste</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  <span>Vue calendrier</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleAddExam()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvel Examen</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={BookOpen} title="Total" value={stats.total} color="bg-blue-500" />
          <StatCard icon={Clock} title="À venir" value={stats.upcoming} color="bg-orange-500" />
          <StatCard icon={AlertCircle} title="Cette semaine" value={stats.thisWeek} color="bg-red-500" />
          <StatCard icon={CheckCircle} title="Passés" value={stats.passed} color="bg-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier ou Liste */}
          <div className="lg:col-span-2">
            {view === 'calendar' ? (
              <CalendarView
                currentDate={currentDate}
                examens={filteredExamens}
                onDateClick={handleAddExam}
                onExamClick={handleEditExam}
                onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
                onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
              />
            ) : (
              <ListView
                examens={filteredExamens}
                uniqueMatieres={uniqueMatieres}
                filterMatiere={filterMatiere}
                setFilterMatiere={setFilterMatiere}
                onEdit={handleEditExam}
                onDelete={handleDeleteExam}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prochains examens */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>Prochains Examens</span>
              </h3>
              <div className="space-y-3">
                {getUpcomingExams().length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun examen à venir
                  </p>
                ) : (
                  getUpcomingExams().map((exam) => (
                    <UpcomingExamCard
                      key={exam.id}
                      exam={exam}
                      onClick={() => handleEditExam(exam)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleAddExam(new Date())}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 border border-blue-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter examen aujourd'hui</span>
                </button>
                <button 
                  onClick={handleExportCalendar}
                  disabled={exportLoading || examens.length === 0}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportLoading ? (
                    <div className="loading-spinner-small" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span>
                    {exportLoading ? 'Export en cours...' : 'Exporter le calendrier'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <ExamModal
          exam={editingExam}
          selectedDate={selectedDate}
          onClose={() => {
            setShowModal(false);
            setEditingExam(null);
            setSelectedDate(null);
          }}
          onSave={handleSaveExam}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT : StatCard
// ═══════════════════════════════════════════════════════════
function StatCard({ icon: Icon, title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT : CalendarView
// ═══════════════════════════════════════════════════════════
function CalendarView({ currentDate, examens, onDateClick, onExamClick, onPrevMonth, onNextMonth }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getExamsForDay = (day) => {
    return examens.filter(exam => isSameDay(new Date(exam.date), day));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={onPrevMonth} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300"
            >
              ←
            </button>
            <button 
              onClick={onNextMonth} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayExams = getExamsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                onClick={() => onDateClick(day)}
                className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                  isCurrentMonth 
                    ? 'bg-white hover:bg-gray-50 border-gray-200' 
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                } ${isCurrentDay ? 'border-blue-500 border-2 bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayExams.slice(0, 2).map((exam) => (
                    <div
                      key={exam.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onExamClick(exam);
                      }}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate hover:bg-blue-200 transition-all duration-200 cursor-pointer border border-blue-200"
                    >
                      {exam.matiere_nom || 'Matière inconnue'}
                    </div>
                  ))}
                  {dayExams.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayExams.length - 2} autre{dayExams.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT : ListView
// ═══════════════════════════════════════════════════════════
function ListView({ examens, uniqueMatieres, filterMatiere, setFilterMatiere, onEdit, onDelete }) {
  const today = new Date();
  const sortedExamens = [...examens].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Liste des Examens</h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterMatiere}
              onChange={(e) => setFilterMatiere(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">Toutes les matières</option>
              {uniqueMatieres.map((matiere) => (
                <option key={matiere} value={matiere}>{matiere}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedExamens.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucun examen prévu</p>
            <p className="text-sm mt-2">Cliquez sur "Nouvel Examen" pour ajouter votre premier examen</p>
          </div>
        ) : (
          sortedExamens.map((exam) => {
            const isPast = isBefore(new Date(exam.date), today);
            const daysUntil = differenceInDays(new Date(exam.date), today);

            return (
              <div key={exam.id} className={`p-6 hover:bg-gray-50 transition-all duration-200 ${isPast ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{exam.matiere_nom || 'Matière inconnue'}</h3>
                      {!isPast && daysUntil <= 7 && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full border border-red-200">
                          Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200">Passé</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{format(new Date(exam.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{exam.heure}</span>
                      </div>
                      {exam.duree && (
                        <div className="flex items-center space-x-2">
                          <span>⏱️ {exam.duree}h</span>
                        </div>
                      )}
                    </div>

                    {exam.salle && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center space-x-2">
                        <span>📍</span>
                        <span>{exam.salle}</span>
                      </p>
                    )}
                    {exam.description && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => onEdit(exam)} 
                      className="p-2 hover:bg-gray-200 rounded-lg transition-all duration-200 border border-gray-300"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => onDelete(exam.id)} 
                      className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-300"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT : UpcomingExamCard
// ═══════════════════════════════════════════════════════════
function UpcomingExamCard({ exam, onClick }) {
  const daysUntil = differenceInDays(new Date(exam.date), new Date());

  return (
    <div 
      onClick={onClick} 
      className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm text-gray-900">{exam.matiere_nom || 'Matière inconnue'}</h4>
        <span className={`text-xs px-2 py-1 rounded-full border ${
          daysUntil <= 3 ? 'bg-red-100 text-red-700 border-red-200' : 
          daysUntil <= 7 ? 'bg-orange-100 text-orange-700 border-orange-200' : 
          'bg-blue-100 text-blue-700 border-blue-200'
        }`}>
          J-{daysUntil}
        </span>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-3 h-3" />
          <span>{format(new Date(exam.date), 'd MMM', { locale: fr })}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3" />
          <span>{exam.heure}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT : ExamModal
// ═══════════════════════════════════════════════════════════
function ExamModal({ exam, selectedDate, onClose, onSave }) {
  const [formData, setFormData] = useState({
    matiere: exam?.matiere_nom || '',
    date: exam?.date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''),
    heure: exam?.heure || '09:00',
    duree: exam?.duree || '2',
    salle: exam?.salle || '',
    description: exam?.description || '',
    type_examen: exam?.type_examen || 'PARTIEL',
    coefficient: exam?.coefficient || '1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.matiere.trim() || !formData.date || !formData.heure) {
      setError('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* En-tête */}
        <div className="modal-header">
          <h2>{exam ? '✏️ Modifier l\'examen' : '✨ Nouvel Examen'}</h2>
          {selectedDate && !exam && (
            <p className="modal-subtitle">
              📅 {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          )}
          <button 
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="error-message">
            <strong>⚠️ Erreur :</strong> {error}
          </div>
        )}

        {/* Formulaire */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Matière - maintenant en zone de texte */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Matière
              </label>
              <input
                type="text"
                value={formData.matiere}
                onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                className="form-input"
                required
                disabled={loading}
                placeholder="Ex: Mathématiques, Physique, Anglais..."
              />
            </div>

            {/* Date et Heure */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.heure}
                  onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Type et Durée */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Type d'examen
                </label>
                <select
                  value={formData.type_examen}
                  onChange={(e) => setFormData({ ...formData, type_examen: e.target.value })}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="PARTIEL">📝 Partiel</option>
                  <option value="FINAL">🎓 Final</option>
                  <option value="CC">📋 Contrôle Continu</option>
                  <option value="TP">🔬 TP</option>
                  <option value="ORAL">🗣️ Oral</option>
                  <option value="QCM">✅ QCM</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Durée (heures)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="8"
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                  className="form-input"
                  disabled={loading}
                  placeholder="2"
                />
              </div>
            </div>

            {/* Salle et Coefficient */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Salle
                </label>
                <input
                  type="text"
                  value={formData.salle}
                  onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                  className="form-input"
                  disabled={loading}
                  placeholder="Ex: Amphi A, Salle 205..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Coefficient
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={formData.coefficient}
                  onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })}
                  className="form-input"
                  disabled={loading}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description / Notes
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="form-textarea"
                disabled={loading}
                placeholder="Chapitres à réviser, documents autorisés, consignes particulières..."
              />
            </div>

            {/* Message d'astuce pour les nouveaux examens */}
            {!exam && (
              <div className="tip-message">
                <strong>💡 Astuce :</strong> Vous pouvez saisir librement le nom de la matière. Les matières déjà utilisées apparaîtront dans les filtres.
              </div>
            )}
          </form>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading || !formData.matiere.trim()}
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                Enregistrement...
              </>
            ) : (
              <>
                {exam ? '✏️ Modifier' : '✨ Créer l\'examen'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}