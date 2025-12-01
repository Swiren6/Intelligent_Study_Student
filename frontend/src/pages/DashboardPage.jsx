import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import { useAPI } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import API_CONFIG from '../config/api.config';

import '../styles/Dashboard.css';

export default function DashboardPage() {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const api = useAPI();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const result = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.BASE);
      
      if (result.success) {
        setSubjects(result.data.subjects || result.data);
      } else {
        showError('Erreur lors du chargement des matières');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showError('Erreur lors du chargement des matières');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      try {
        const result = await api.del(API_CONFIG.ENDPOINTS.SUBJECTS.DELETE(id));
        
        if (result.success) {
          setSubjects(subjects.filter(s => s.id !== id));
          showSuccess('Matière supprimée avec succès');
        } else {
          showError('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
        showError('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setShowModal(true);
  };

  const handleViewTasks = (subjectId) => {
    navigate(`/matiere/${subjectId}/tasks`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  // Calculer les statistiques
  const totalTasks = subjects.reduce((acc, s) => acc + (s.tasks_count || 0), 0);
  const completedTasks = subjects.reduce((acc, s) => acc + (s.completed_tasks || 0), 0);

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Mes Matières</h1>
            <p className="dashboard-subtitle">Gérez vos matières et organisez vos études</p>
          </div>
          <button
            onClick={handleAdd}
            className="add-button"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Matière</span>
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <p className="stat-label">Total Matières</p>
                <p className="stat-value stat-blue">{subjects.length}</p>
              </div>
              <BookOpen className="stat-icon" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <p className="stat-label">Tâches en cours</p>
                <p className="stat-value stat-orange">{totalTasks}</p>
              </div>
              <div className="stat-emoji-container emoji-orange">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <p className="stat-label">Tâches complétées</p>
                <p className="stat-value stat-green">{completedTasks}</p>
              </div>
              <div className="stat-emoji-container emoji-green">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des matières */}
        {subjects.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3 className="empty-title">Aucune matière</h3>
            <p className="empty-description">
              Commencez par créer votre première matière
            </p>
            <button
              onClick={handleAdd}
              className="add-button"
            >
              Créer une matière
            </button>
          </div>
        ) : (
          <div className="matieres-grid">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="matiere-card"
              >
                {/* Header coloré */}
                <div 
                  className="matiere-header"
                  style={{ 
                    background: `linear-gradient(135deg, ${subject.color || '#646cff'} 0%, ${subject.color || '#535bf2'} 100%)`
                  }}
                >
                  <div className="matiere-header-content">
                    <h3 className="matiere-name">{subject.nom}</h3>
                    <div className="matiere-tags">
                      <span className="matiere-tag">
                        {subject.tasks_count || 0} tâches
                      </span>
                      <span className="matiere-tag">
                        {subject.niveau_difficulte || 'Moyen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="matiere-content">
                  <p className="matiere-description">
                    {subject.description || 'Aucune description'}
                  </p>

                  {/* Progression */}
                  <div className="progress-container">
                    <div className="progress-header">
                      <span className="progress-label">Progression</span>
                      <span className="progress-value">
                        {subject.completed_tasks || 0}/{subject.tasks_count || 0}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            subject.tasks_count
                              ? (subject.completed_tasks / subject.tasks_count) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="matiere-actions">
                    <button
                      onClick={() => handleViewTasks(subject.id)}
                      className="view-button"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir tâches</span>
                    </button>
                    
                    <button
                      onClick={() => handleEdit(subject)}
                      className="icon-button edit-button"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="icon-button delete-button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <SubjectModal
          subject={editingSubject}
          onClose={() => {
            setShowModal(false);
            setEditingSubject(null);
          }}
          onSave={() => {
            fetchSubjects();
            setShowModal(false);
            setEditingSubject(null);
          }}
        />
      )}
    </div>
  );
}

// Modal pour ajouter/modifier une matière
function SubjectModal({ subject, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: subject?.nom || '',
    description: subject?.description || '',
    niveau_difficulte: subject?.niveau_difficulte || 'MOYEN',
    color: subject?.color || '#646cff',
    duree_totale_heures: subject?.duree_totale_heures || 0,
    priorite: subject?.priorite || 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const api = useAPI();
  const { showSuccess, showError } = useToast();

  const colors = [
    { name: 'Bleu', value: '#646cff' },
    { name: 'Vert', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Rose', value: '#ec4899' },
    { name: 'Rouge', value: '#ef4444' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (subject) {
        result = await api.put(API_CONFIG.ENDPOINTS.SUBJECTS.UPDATE(subject.id), formData);
      } else {
        result = await api.post(API_CONFIG.ENDPOINTS.SUBJECTS.CREATE, formData);
      }
      
      if (result.success) {
        showSuccess(subject ? 'Matière modifiée avec succès' : 'Matière créée avec succès');
        onSave();
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {subject ? 'Modifier la matière' : 'Nouvelle matière'}
          </h2>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">
              Nom de la matière *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Niveau de difficulté
              </label>
              <select
                value={formData.niveau_difficulte}
                onChange={(e) =>
                  setFormData({ ...formData, niveau_difficulte: e.target.value })
                }
                className="form-select"
              >
                <option value="FACILE">Facile</option>
                <option value="MOYEN">Moyen</option>
                <option value="DIFFICILE">Difficile</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Priorité (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.priorite}
                onChange={(e) =>
                  setFormData({ ...formData, priorite: parseInt(e.target.value) })
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Couleur</label>
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="save-button"
            >
              {loading ? 'Enregistrement...' : subject ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}