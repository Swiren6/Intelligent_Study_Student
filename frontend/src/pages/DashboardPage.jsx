import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
//import api from '../services/api';

import '../styles/Dashboard.css';



export default function DashboardPage() {
  const [matieres, setMatieres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatieres();
  }, []);

  const fetchMatieres = async () => {
    try {
      // Simulation de données pour le développement
      const mockMatieres = [
        {
          id: 1,
          nom: 'Mathématiques',
          description: 'Algèbre et géométrie avancée',
          niveau_difficulte: 'DIFFICILE',
          color: '#646cff',
          tasks_count: 8,
          completed_tasks: 3
        },
        {
          id: 2,
          nom: 'Physique',
          description: 'Mécanique et thermodynamique',
          niveau_difficulte: 'MOYEN',
          color: '#10b981',
          tasks_count: 5,
          completed_tasks: 2
        },
        {
          id: 3,
          nom: 'Chimie',
          description: 'Chimie organique et inorganique',
          niveau_difficulte: 'FACILE',
          color: '#8b5cf6',
          tasks_count: 6,
          completed_tasks: 6
        }
      ];
      setMatieres(mockMatieres);
      
      // En production, utilisez l'API réelle :
      // const response = await api.get('/matieres');
      // setMatieres(response.data);
    } catch (error) {
      console.error('Error fetching matieres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      try {
        // await api.delete(`/matieres/${id}`);
        setMatieres(matieres.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error deleting matiere:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (matiere) => {
    setEditingMatiere(matiere);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingMatiere(null);
    setShowModal(true);
  };

  const handleViewTasks = (matiereId) => {
    navigate(`/matiere/${matiereId}/tasks`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Mes Matières</h1>
            <p className="dashboard-subtitle">Gérez vos matières et leurs tâches</p>
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
                <p className="stat-value stat-blue">{matieres.length}</p>
              </div>
              <BookOpen className="stat-icon" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <p className="stat-label">Tâches en cours</p>
                <p className="stat-value stat-orange">
                  {matieres.reduce((acc, m) => acc + (m.tasks_count || 0), 0)}
                </p>
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
                <p className="stat-value stat-green">
                  {matieres.reduce((acc, m) => acc + (m.completed_tasks || 0), 0)}
                </p>
              </div>
              <div className="stat-emoji-container emoji-green">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des matières */}
        {matieres.length === 0 ? (
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
            {matieres.map((matiere) => (
              <div
                key={matiere.id}
                className="matiere-card"
              >
                {/* Header coloré */}
                <div 
                  className="matiere-header"
                  style={{ 
                    background: `linear-gradient(135deg, ${matiere.color || '#646cff'} 0%, ${matiere.color || '#535bf2'} 100%)`
                  }}
                >
                  <div className="matiere-header-content">
                    <h3 className="matiere-name">{matiere.nom}</h3>
                    <div className="matiere-tags">
                      <span className="matiere-tag">
                        {matiere.tasks_count || 0} tâches
                      </span>
                      <span className="matiere-tag">
                        {matiere.niveau_difficulte || 'Moyen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="matiere-content">
                  <p className="matiere-description">
                    {matiere.description || 'Aucune description'}
                  </p>

                  {/* Progression */}
                  <div className="progress-container">
                    <div className="progress-header">
                      <span className="progress-label">Progression</span>
                      <span className="progress-value">
                        {matiere.completed_tasks || 0}/{matiere.tasks_count || 0}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            matiere.tasks_count
                              ? (matiere.completed_tasks / matiere.tasks_count) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="matiere-actions">
                    <button
                      onClick={() => handleViewTasks(matiere.id)}
                      className="view-button"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir tâches</span>
                    </button>
                    
                    <button
                      onClick={() => handleEdit(matiere)}
                      className="icon-button edit-button"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(matiere.id)}
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
        <MatiereModal
          matiere={editingMatiere}
          onClose={() => {
            setShowModal(false);
            setEditingMatiere(null);
          }}
          onSave={() => {
            fetchMatieres();
            setShowModal(false);
            setEditingMatiere(null);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT : MatiereModal
// Modal pour ajouter/modifier une matière
// ═══════════════════════════════════════════════════════════

function MatiereModal({ matiere, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: matiere?.nom || '',
    description: matiere?.description || '',
    niveau_difficulte: matiere?.niveau_difficulte || 'MOYEN',
    color: matiere?.color || '#646cff',
    duree_totale_heures: matiere?.duree_totale_heures || 0,
    priorite: matiere?.priorite || 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En production, utilisez l'API réelle :
      // if (matiere) {
      //   await api.put(`/matieres/${matiere.id}`, formData);
      // } else {
      //   await api.post('/matieres', formData);
      // }
      
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {matiere ? 'Modifier la matière' : 'Nouvelle matière'}
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
              {loading ? 'Enregistrement...' : matiere ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}