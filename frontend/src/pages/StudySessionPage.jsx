import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Clock, CheckCircle, 
  BookOpen, Target, Coffee, Brain, Star,
  SkipForward, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import { useToast } from '../context/ToastContext';
import '../styles/study-session.css';

export default function StudySessionPage() {
  const { showSuccess, showInfo } = useToast();
  
  const [sessionActive, setSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionData, setSessionData] = useState({
    matiere: '',
    type: 'revision',
    objectif: '',
    duree_prevue: 25
  });
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState({
    concentration: 5,
    comprehension: 5,
    notes: ''
  });
  const [pomodoroMode, setPomodoroMode] = useState(true);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Créer un son de notification
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYJGGS46+mxSxELSKHd8rljHQQ2jdTyp381DxlluOvosUwRDEaf4PK/ayEFLYPP8tmJNgkXZrfr6bNLEw1HoNzxwGcdBDSM0vLjdC8OGGm56+mzSxEMRp/g8sBqIgUrhM7y2Yk2CRdlt+vos0sSDUeg3PLAZx0EMozS8uN0Lw4YaLjr6bNLEQxGn+DywGsi');
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (sessionActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionActive, isPaused]);

  useEffect(() => {
    if (pomodoroMode && time > 0) {
      const targetMinutes = isBreak ? 5 : sessionData.duree_prevue;
      if (time === targetMinutes * 60) {
        handlePomodoroComplete();
      }
    }
  }, [time, pomodoroMode, isBreak, sessionData.duree_prevue]);

  const handlePomodoroComplete = () => {
    audioRef.current?.play();
    
    if (isBreak) {
      setIsBreak(false);
      setTime(0);
      setIsPaused(true);
      showInfo('Pause terminée! Prêt pour un nouveau pomodoro?');
    } else {
      setPomodoroCount(prev => prev + 1);
      setTime(0);
      setIsPaused(true);
      
      if (pomodoroCount + 1 >= 4) {
        showSuccess('4 pomodoros complétés! Prenez une longue pause (15-30 min)');
        setPomodoroCount(0);
      } else {
        setIsBreak(true);
        showInfo('Pomodoro terminé! Prenez une pause de 5 minutes');
      }
    }
  };

  const handleStartSession = () => {
    if (!sessionData.matiere || !sessionData.objectif) {
      alert('Veuillez remplir la matière et l\'objectif');
      return;
    }
    
    setSessionActive(true);
    setIsPaused(false);
    setTime(0);
    showInfo('Session démarrée! Bon courage! 💪');
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    showInfo(isPaused ? 'Session reprise' : 'Session en pause');
  };

  const handleStopSession = () => {
    setSessionActive(false);
    setIsPaused(false);
    setShowEvaluation(true);
  };

  const handleSaveEvaluation = () => {
    // Sauvegarder la session
    const session = {
      ...sessionData,
      duree_reelle: time,
      evaluation,
      date: new Date().toISOString()
    };
    
    console.log('Session saved:', session);
    
    // Reset
    setShowEvaluation(false);
    setTime(0);
    setSessionData({
      matiere: '',
      type: 'revision',
      objectif: '',
      duree_prevue: 25
    });
    setEvaluation({
      concentration: 5,
      comprehension: 5,
      notes: ''
    });
    
    showSuccess('Session enregistrée avec succès!');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!pomodoroMode) return 0;
    const targetMinutes = isBreak ? 5 : sessionData.duree_prevue;
    return Math.min((time / (targetMinutes * 60)) * 100, 100);
  };

  return (
    <div className="study-session-page">
      <Navbar />

      <main className="session-container">
        <div className="session-header">
          <h1>{isBreak ? '☕ Pause' : '📚 Session d\'étude'}</h1>
          <p>
            {isBreak 
              ? 'Reposez-vous quelques minutes...' 
              : 'Concentrez-vous et donnez le meilleur de vous-même'}
          </p>
        </div>

        {!sessionActive ? (
          /* Configuration de la session */
          <div className="session-setup">
            <h2 className="setup-title">Nouvelle session d'étude</h2>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Matière *</label>
                <input
                  type="text"
                  value={sessionData.matiere}
                  onChange={(e) => setSessionData({ ...sessionData, matiere: e.target.value })}
                  placeholder="Ex: Mathématiques, Physique..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de session</label>
                <select
                  value={sessionData.type}
                  onChange={(e) => setSessionData({ ...sessionData, type: e.target.value })}
                  className="form-select"
                >
                  <option value="revision">📖 Révision</option>
                  <option value="exercices">✍️ Exercices</option>
                  <option value="lecture">📚 Lecture</option>
                  <option value="projet">💻 Projet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Objectif de la session *</label>
                <textarea
                  value={sessionData.objectif}
                  onChange={(e) => setSessionData({ ...sessionData, objectif: e.target.value })}
                  placeholder="Décrivez ce que vous souhaitez accomplir..."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div className="pomodoro-toggle">
                <div className="pomodoro-content">
                  <div className="pomodoro-info">
                    <Brain className="pomodoro-icon" />
                    <div className="pomodoro-text">
                      <h4>Mode Pomodoro</h4>
                      <p>25 min de travail + 5 min de pause</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={pomodoroMode}
                      onChange={(e) => setPomodoroMode(e.target.checked)}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {pomodoroMode && (
                <div className="form-group">
                  <label className="form-label">Durée du pomodoro (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    value={sessionData.duree_prevue}
                    onChange={(e) => setSessionData({ ...sessionData, duree_prevue: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>
              )}

              <button
                onClick={handleStartSession}
                className="start-button"
              >
                <Play size={20} />
                Commencer la session
              </button>
            </div>
          </div>
        ) : (
          /* Session active */
          <div className="active-session">
            {/* Timer principal */}
            <div className="timer-card">
              <div className="session-badge">
                {isBreak ? '☕ Pause' : sessionData.matiere}
              </div>
              {pomodoroMode && (
                <div className="pomodoro-counter">
                  Pomodoro {pomodoroCount + 1}/4
                </div>
              )}

              <div className="timer-container">
                <svg className="timer-circle">
                  <circle
                    cx="140"
                    cy="140"
                    r="130"
                    className="timer-background"
                  />
                  <circle
                    cx="140"
                    cy="140"
                    r="130"
                    className={`timer-progress ${isBreak ? 'break' : 'active'}`}
                    strokeDasharray={`${2 * Math.PI * 130}`}
                    strokeDashoffset={`${2 * Math.PI * 130 * (1 - getProgressPercentage() / 100)}`}
                  />
                </svg>
                <div className="timer-display">
                  <div className="timer-time">
                    {formatTime(time)}
                  </div>
                  {pomodoroMode && (
                    <div className="timer-remaining">
                      {isBreak 
                        ? `${Math.floor((5 * 60 - time) / 60)} min restantes`
                        : `${Math.floor((sessionData.duree_prevue * 60 - time) / 60)} min restantes`
                      }
                    </div>
                  )}
                </div>
              </div>

              <div className="control-buttons">
                <button
                  onClick={handlePauseResume}
                  className="control-button primary"
                >
                  {isPaused ? (
                    <>
                      <Play size={18} />
                      Reprendre
                    </>
                  ) : (
                    <>
                      <Pause size={18} />
                      Pause
                    </>
                  )}
                </button>

                <button
                  onClick={handleStopSession}
                  className="control-button danger"
                >
                  <Square size={18} />
                  Terminer
                </button>

                {pomodoroMode && !isBreak && (
                  <button
                    onClick={handlePomodoroComplete}
                    className="control-button secondary"
                  >
                    <SkipForward size={18} />
                    Passer
                  </button>
                )}
              </div>
            </div>

            {/* Info session */}
            <div className="session-info">
              <h3>Objectif de la session</h3>
              <p>{sessionData.objectif}</p>
            </div>

            {/* Conseils */}
            <div className="tips-card">
              <div className="tips-header">
                <Brain className="tips-icon" />
                <div className="tips-content">
                  <h4>💡 Conseils</h4>
                  <ul className="tips-list">
                    <li>Éliminez toutes les distractions (téléphone, réseaux sociaux)</li>
                    <li>Concentrez-vous sur une seule tâche à la fois</li>
                    <li>Prenez des notes pour mémoriser les points importants</li>
                    <li>Hydratez-vous régulièrement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'évaluation */}
        {showEvaluation && (
          <div className="evaluation-modal">
            <div className="modal-content">
              <h2 className="modal-title">🎯 Évaluez votre session</h2>

              <div className="space-y-4">
                <div className="rating-group">
                  <div className="rating-label">
                    <span className="rating-name">Niveau de concentration</span>
                  </div>
                  <div className="rating-scale">
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setEvaluation({ ...evaluation, concentration: i + 1 })}
                        className={`rating-button concentration-button ${i < evaluation.concentration ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rating-group">
                  <div className="rating-label">
                    <span className="rating-name">Compréhension</span>
                  </div>
                  <div className="rating-scale">
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setEvaluation({ ...evaluation, comprehension: i + 1 })}
                        className={`rating-button comprehension-button ${i < evaluation.comprehension ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes et commentaires</label>
                  <textarea
                    value={evaluation.notes}
                    onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
                    placeholder="Points clés appris, difficultés rencontrées..."
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <div className="session-summary">
                  <div className="summary-item">
                    <Clock className="summary-icon" />
                    <span className="summary-label">Durée totale:</span>
                    <span className="summary-value">{formatTime(time)}</span>
                  </div>
                  <div className="summary-item">
                    <Target className="summary-icon" />
                    <span className="summary-label">Objectif:</span>
                    <span className="summary-value">{sessionData.objectif}</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveEvaluation}
                  className="save-button"
                >
                  <CheckCircle size={20} />
                  Enregistrer la session
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}