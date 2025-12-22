import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Clock, CheckCircle, Download, ChevronRight, Zap
} from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import { useToast } from '../context/ToastContext';
import '../styles/planning-generator.css';

export default function PlanningGeneratorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [matieres, setMatieres] = useState([]);
  const [formData, setFormData] = useState({
    date_debut: '',
    date_fin: '',
    matieres_selectionnees: [],
    priorites: {},
    temps_etude_jour: 4,
    preferences_creneaux: 'equilibre',
    inclure_weekend: true
  });
  const [generatedPlanning, setGeneratedPlanning] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setMatieres([
        { id: 1, nom: 'Mathématiques' },
        { id: 2, nom: 'Physique' },
        { id: 3, nom: 'Chimie' },
        { id: 4, nom: 'Informatique' },
        { id: 5, nom: 'Anglais' },
        { id: 6, nom: 'Histoire' },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleMatiereToggle = (matiereId) => {
    setFormData(prev => ({
      ...prev,
      matieres_selectionnees: prev.matieres_selectionnees.includes(matiereId)
        ? prev.matieres_selectionnees.filter(id => id !== matiereId)
        : [...prev.matieres_selectionnees, matiereId]
    }));
  };

  const handlePrioriteChange = (matiereId, priorite) => {
    setFormData(prev => ({
      ...prev,
      priorites: {
        ...prev.priorites,
        [matiereId]: priorite
      }
    }));
  };

  const handleGeneratePlanning = async () => {
    if (formData.matieres_selectionnees.length === 0) {
      showError('Veuillez sélectionner au moins une matière');
      return;
    }

    if (!formData.date_debut || !formData.date_fin) {
      showError('Veuillez définir une période');
      return;
    }

    setLoading(true);
    showInfo('Génération du planning en cours...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPlanning = {
        id: Date.now(),
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        sessions: [
          {
            id: 1,
            matiere: 'Mathématiques',
            jour: 'Lundi',
            date: '2024-06-03',
            heure_debut: '14:00',
            heure_fin: '16:00',
            type: 'Révision',
            objectif: 'Chapitre 5 - Intégrales'
          },
          {
            id: 2,
            matiere: 'Physique',
            jour: 'Mardi',
            date: '2024-06-04',
            heure_debut: '09:00',
            heure_fin: '11:00',
            type: 'Exercices',
            objectif: 'Mécanique quantique'
          },
          {
            id: 3,
            matiere: 'Informatique',
            jour: 'Mercredi',
            date: '2024-06-05',
            heure_debut: '15:00',
            heure_fin: '17:00',
            type: 'Projet',
            objectif: 'Développement API REST'
          }
        ],
        statistiques: {
          total_heures: 24,
          sessions_par_semaine: 8
        }
      };

      setGeneratedPlanning(mockPlanning);
      setStep(3);
      showSuccess('Planning généré avec succès');
    } catch (error) {
      console.error('Error generating planning:', error);
      showError('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlanning = async () => {
    try {
      showSuccess('Planning sauvegardé');
      navigate('/dashboard');
    } catch (error) {
      showError('Erreur lors de la sauvegarde');
    }
  };

  const handleExportPlanning = () => {
    showSuccess('Planning exporté');
  };

  return (
    <div className="planning-generator-page">
      <Navbar />

      <main className="planning-container">
        <div className="planning-header">
          <h1>Générateur de Planning</h1>
          <p>
            Créez votre planning d'étude basé sur vos disponibilités
          </p>
        </div>

        <div className="progress-steps">
          <div className="steps-container">
            {[1, 2, 3].map((stepNum, index) => (
              <div key={stepNum} className="step-item">
                <div className={`
                  step-number 
                  ${step > stepNum ? 'completed' : ''}
                  ${step === stepNum ? 'active' : ''}
                  ${step < stepNum ? 'inactive' : ''}
                `}>
                  {step > stepNum ? <CheckCircle size={16} /> : stepNum}
                </div>
                <div className="step-content">
                  <div className={`
                    step-label
                    ${step > stepNum ? 'completed' : ''}
                    ${step === stepNum ? 'active' : ''}
                    ${step < stepNum ? 'inactive' : ''}
                  `}>
                    {stepNum === 1 && 'Période & Matières'}
                    {stepNum === 2 && 'Préférences'}
                    {stepNum === 3 && 'Planning'}
                  </div>
                </div>
                {index < 2 && (
                  <div className={`
                    step-connector
                    ${step > stepNum ? 'completed' : step >= stepNum ? 'active' : ''}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="planning-content">
          <div className="step-content-container">
            {step === 1 && (
              <Step1
                formData={formData}
                setFormData={setFormData}
                matieres={matieres}
                onMatiereToggle={handleMatiereToggle}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <Step2
                formData={formData}
                setFormData={setFormData}
                matieres={matieres}
                onPrioriteChange={handlePrioriteChange}
                onBack={() => setStep(1)}
                onGenerate={handleGeneratePlanning}
                loading={loading}
              />
            )}

            {step === 3 && generatedPlanning && (
              <Step3
                planning={generatedPlanning}
                onSave={handleSavePlanning}
                onExport={handleExportPlanning}
                onBack={() => setStep(2)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Step 1: Période et Matières
function Step1({ formData, setFormData, matieres, onMatiereToggle, onNext }) {
  return (
    <div className="space-y-6">
      <h2 className="step-title">Période d'étude</h2>

      <div className="date-range-grid">
        <div className="date-input-group">
          <label className="date-label">Date de début</label>
          <input
            type="date"
            value={formData.date_debut}
            onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
            className="date-input"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="date-input-group">
          <label className="date-label">Date de fin</label>
          <input
            type="date"
            value={formData.date_fin}
            onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
            className="date-input"
            min={formData.date_debut || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="subjects-section">
        <h3 className="section-title">Matières à réviser</h3>
        <div className="subjects-grid">
          {matieres.map((matiere) => (
            <div
              key={matiere.id}
              className={`subject-card ${formData.matieres_selectionnees.includes(matiere.id) ? 'selected' : ''}`}
              onClick={() => onMatiereToggle(matiere.id)}
            >
              <div className="subject-content">
                <span className="subject-name">{matiere.nom}</span>
                {formData.matieres_selectionnees.includes(matiere.id) && (
                  <CheckCircle className="subject-check" size={18} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="buttons-container">
        <button
          onClick={onNext}
          disabled={formData.matieres_selectionnees.length === 0 || !formData.date_debut || !formData.date_fin}
          className="action-button primary"
        >
          <span>Continuer</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// Step 2: Préférences
function Step2({ formData, setFormData, matieres, onPrioriteChange, onBack, onGenerate, loading }) {
  const selectedMatieres = matieres.filter(m => formData.matieres_selectionnees.includes(m.id));

  return (
    <div className="space-y-6">
      <h2 className="step-title">Préférences</h2>

      <div className="priorities-section">
        <h3 className="section-title">Priorités</h3>
        {selectedMatieres.map((matiere) => (
          <div key={matiere.id} className="priority-item">
            <div className="priority-header">
              <span className="priority-name">{matiere.nom}</span>
              <span className="priority-value">{formData.priorites[matiere.id] || 5}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.priorites[matiere.id] || 5}
              onChange={(e) => onPrioriteChange(matiere.id, parseInt(e.target.value))}
              className="priority-slider"
            />
          </div>
        ))}
      </div>

      <div className="preferences-grid">
        <div className="preference-group">
          <label className="preference-label">Heures par jour</label>
          <input
            type="number"
            min="1"
            max="12"
            value={formData.temps_etude_jour}
            onChange={(e) => setFormData({ ...formData, temps_etude_jour: parseInt(e.target.value) || 4 })}
            className="preference-input"
          />
        </div>

        <div className="preference-group">
          <label className="preference-label">Répartition</label>
          <select
            value={formData.preferences_creneaux}
            onChange={(e) => setFormData({ ...formData, preferences_creneaux: e.target.value })}
            className="preference-select"
          >
            <option value="matin">Matin</option>
            <option value="apres-midi">Après-midi</option>
            <option value="soir">Soir</option>
            <option value="equilibre">Équilibré</option>
          </select>
        </div>
      </div>

      <div 
        className="weekend-toggle"
        onClick={() => setFormData({ ...formData, inclure_weekend: !formData.inclure_weekend })}
      >
        <div className={`weekend-checkbox ${formData.inclure_weekend ? 'checked' : ''}`} />
        <span className="weekend-label">Inclure les weekends</span>
      </div>

      <div className="buttons-container">
        <button
          onClick={onBack}
          className="action-button secondary"
        >
          Retour
        </button>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="action-button primary"
        >
          {loading ? (
            <>
              <div className="loading-spinner" />
              <span>Génération...</span>
            </>
          ) : (
            <>
              <Zap size={18} />
              <span>Générer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Step 3: Planning généré
function Step3({ planning, onSave, onExport, onBack }) {
  return (
    <div className="space-y-6">
      <div className="planning-success-header">
        <h2 className="success-title">Planning généré</h2>
        <div className="planning-actions">
          <button
            onClick={onExport}
            className="action-button outline"
          >
            <Download size={16} />
            Exporter
          </button>
          <button
            onClick={onSave}
            className="action-button solid"
          >
            <CheckCircle size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{planning.statistiques.total_heures}h</div>
          <div className="stat-label">Heures totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{planning.sessions.length}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{planning.statistiques.sessions_par_semaine}</div>
          <div className="stat-label">Sessions/semaine</div>
        </div>
      </div>

      <div className="sessions-list">
        <h3 className="sessions-header">Sessions programmées</h3>
        <div className="sessions-container">
          {planning.sessions.map((session) => (
            <div key={session.id} className="session-item">
              <div className="session-header">
                <div className="session-subject">
                  <span className="subject-tag">{session.matiere}</span>
                  <span className="session-type">{session.type}</span>
                </div>
              </div>
              
              <div className="session-meta">
                <div className="session-meta-item">
                  <Calendar className="meta-icon" size={16} />
                  <span>{session.jour} ({session.date})</span>
                </div>
                <div className="session-meta-item">
                  <Clock className="meta-icon" size={16} />
                  <span>{session.heure_debut} - {session.heure_fin}</span>
                </div>
              </div>
              
              <p className="session-objective">
                {session.objectif}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="buttons-container">
        <button
          onClick={onBack}
          className="action-button secondary"
        >
          Modifier
        </button>
      </div>
    </div>
  );
}