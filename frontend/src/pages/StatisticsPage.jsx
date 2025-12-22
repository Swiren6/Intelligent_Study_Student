import { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, CheckCircle, Target, 
  Calendar, BookOpen, Award, Activity,
  BarChart3, PieChart, Download
} from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import '../styles/statistics.css';

export default function StatisticsPage() {
  const [periode, setPeriode] = useState('semaine');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [periode]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        temps_etudie: {
          total: 28.5,
          objectif: 35,
          pourcentage: 81
        },
        taches: {
          completees: 24,
          en_cours: 8,
          total: 32,
          taux_completion: 75
        },
        matieres: [
          { nom: 'Mathématiques', temps: 8.5, progression: 85, couleur: '#3B82F6' },
          { nom: 'Physique', temps: 7.2, progression: 70, couleur: '#10B981' },
          { nom: 'Chimie', temps: 6.5, progression: 65, couleur: '#F59E0B' },
          { nom: 'Informatique', temps: 6.3, progression: 80, couleur: '#8B5CF6' }
        ],
        progression_hebdomadaire: [
          { jour: 'Lun', heures: 4.5 },
          { jour: 'Mar', heures: 5.2 },
          { jour: 'Mer', heures: 3.8 },
          { jour: 'Jeu', heures: 4.9 },
          { jour: 'Ven', heures: 6.1 },
          { jour: 'Sam', heures: 2.5 },
          { jour: 'Dim', heures: 1.5 }
        ],
        sessions: [
          { date: '2024-01-15', matiere: 'Mathématiques', duree: 2, note: 8 },
          { date: '2024-01-16', matiere: 'Physique', duree: 1.5, note: 7 },
          { date: '2024-01-17', matiere: 'Chimie', duree: 3, note: 9 },
          { date: '2024-01-18', matiere: 'Informatique', duree: 2.5, note: 8.5 },
          { date: '2024-01-19', matiere: 'Anglais', duree: 1, note: 6 }
        ],
        objectifs: {
          atteints: 12,
          en_cours: 5,
          total: 17
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert('Export des statistiques en cours...');
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <Navbar />

      <main className="statistics-container">
        {/* Header */}
        <div className="statistics-header">
          <div className="header-top">
            <div className="header-title">
              <h1>📊 Statistiques & Progression</h1>
              <p>Suivez votre progression et analysez vos performances</p>
            </div>
            
            <div className="header-controls">
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="period-select"
              >
                <option value="semaine">Cette semaine</option>
                <option value="mois">Ce mois</option>
                <option value="trimestre">Ce trimestre</option>
                <option value="annee">Cette année</option>
              </select>

              <button
                onClick={handleExport}
                className="export-button"
              >
                <Download size={18} />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques principales */}
        <div className="stats-grid">
          <StatCard
            icon={Clock}
            title="Temps d'étude"
            value={`${stats.temps_etudie.total}h`}
            subtitle={`Objectif: ${stats.temps_etudie.objectif}h`}
            progress={stats.temps_etudie.pourcentage}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            title="Tâches complétées"
            value={stats.taches.completees}
            subtitle={`${stats.taches.total} au total`}
            progress={stats.taches.taux_completion}
            color="green"
          />
          <StatCard
            icon={Target}
            title="Objectifs"
            value={`${stats.objectifs.atteints}/${stats.objectifs.total}`}
            subtitle={`${stats.objectifs.en_cours} en cours`}
            progress={(stats.objectifs.atteints / stats.objectifs.total) * 100}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Moyenne générale"
            value="8.2/10"
            subtitle="Sessions évaluées"
            progress={82}
            color="orange"
          />
        </div>

        {/* Graphiques principaux */}
        <div className="charts-grid">
          {/* Graphique hebdomadaire */}
          <div className="chart-container">
            <div className="chart-header">
              <h2 className="chart-title">
                <BarChart3 className="chart-icon blue" />
                Progression hebdomadaire
              </h2>
            </div>
            <WeeklyChart data={stats.progression_hebdomadaire} />
          </div>

          {/* Répartition par matière */}
          <div className="chart-container">
            <div className="chart-header">
              <h2 className="chart-title">
                <PieChart className="chart-icon purple" />
                Par matière
              </h2>
            </div>
            <div className="subjects-list">
              {stats.matieres.map((matiere, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-header">
                    <span className="subject-name">{matiere.nom}</span>
                    <span className="subject-hours">{matiere.temps}h</span>
                  </div>
                  <div className="subject-progress-container">
                    <div className="subject-progress-bar">
                      <div
                        className="subject-progress-fill"
                        style={{
                          width: `${matiere.progression}%`,
                          backgroundColor: matiere.couleur
                        }}
                      />
                    </div>
                    <div className="subject-progress-labels">
                      <span className="subject-progress-label">Progression</span>
                      <span className="subject-progress-percentage" style={{ color: matiere.couleur }}>
                        {matiere.progression}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sessions récentes */}
        <div className="sessions-container">
          <div className="sessions-header">
            <Activity className="sessions-icon" />
            <h2 className="sessions-title">Sessions récentes</h2>
          </div>
          
          <div className="sessions-table-wrapper">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matière</th>
                  <th>Durée</th>
                  <th>Évaluation</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {stats.sessions.map((session, index) => (
                  <tr key={index}>
                    <td>
                      {new Date(session.date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </td>
                    <td>{session.matiere}</td>
                    <td>{session.duree}h</td>
                    <td>
                      <div className="rating-container">
                        <div className="rating-bar">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`rating-segment ${i < session.note ? 'active' : 'inactive'}`}
                            />
                          ))}
                        </div>
                        <span className="rating-value">{session.note}/10</span>
                      </div>
                    </td>
                    <td>
                      <span className={`performance-badge ${
                        session.note >= 8 
                          ? 'excellent' 
                          : session.note >= 6 
                          ? 'good' 
                          : 'needs-improvement'
                      }`}>
                        {session.note >= 8 ? 'Excellent' : session.note >= 6 ? 'Bien' : 'À améliorer'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, progress, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon-container ${color}`}>
        <Icon className={`stat-icon ${color}`} />
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-subtitle">{subtitle}</p>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className={`progress-fill ${color}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-label">
            <span className="progress-text">Progression</span>
            <span className={`progress-percentage ${color}`}>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyChart({ data }) {
  const maxHours = Math.max(...data.map(d => d.heures));
  
  return (
    <div className="weekly-chart-container">
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-bar">
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{ height: `${(item.heures / maxHours) * 100}%` }}
              >
                <span className="bar-value">{item.heures}h</span>
              </div>
            </div>
            <span className="bar-label">{item.jour}</span>
          </div>
        ))}
      </div>
      <div className="chart-axis" />
    </div>
  );
}