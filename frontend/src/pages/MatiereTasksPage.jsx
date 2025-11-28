import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';

import '../styles/MatiereTasksPage.css';

export default function MatiereTasksPage() {
  const { matiereId } = useParams();
  const navigate = useNavigate();
  const [matiere, setMatiere] = useState(null);
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'À faire', color: 'column-todo', tasks: [] },
    { id: 'in_progress', title: 'En cours', color: 'column-in_progress', tasks: [] },
    { id: 'review', title: 'En révision', color: 'column-review', tasks: [] },
    { id: 'done', title: 'Terminé', color: 'column-done', tasks: [] },
  ]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    fetchMatiereAndTasks();
  }, [matiereId]);

  const fetchMatiereAndTasks = async () => {
    try {
      // Simulation de données
      const mockMatiere = {
        id: matiereId,
        nom: 'Mathématiques',
        description: 'Algèbre et géométrie avancée',
        color: '#646cff'
      };
      setMatiere(mockMatiere);

      const mockTasks = [
        {
          id: 1,
          titre: 'Exercices de dérivation',
          description: 'Compléter les exercices 1 à 10 sur les dérivées',
          priorite: 'HAUTE',
          date_limite: '2024-12-20',
          temps_estime: 3,
          labels: ['urgent', 'devoir'],
          status: 'todo'
        },
        {
          id: 2,
          titre: 'Révision intégrales',
          description: 'Revoir le chapitre sur les intégrales multiples',
          priorite: 'MOYENNE',
          date_limite: '2024-12-25',
          temps_estime: 2,
          labels: ['révision'],
          status: 'in_progress'
        },
        {
          id: 3,
          titre: 'Projet analyse',
          description: 'Terminer le projet d analyse complexe',
          priorite: 'BASSE',
          date_limite: '2024-12-30',
          temps_estime: 5,
          labels: ['projet', 'long terme'],
          status: 'review'
        },
        {
          id: 4,
          titre: 'Quiz trigonométrie',
          description: 'Quiz complété avec succès',
          priorite: 'MOYENNE',
          date_limite: '2024-12-15',
          temps_estime: 1,
          labels: ['quiz'],
          status: 'done'
        }
      ];

      const updatedColumns = columns.map(col => ({
        ...col,
        tasks: mockTasks.filter(task => task.status === col.id)
      }));
      setColumns(updatedColumns);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (columnId) => {
    setSelectedColumn(columnId);
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task, columnId) => {
    setSelectedColumn(columnId);
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId, columnId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        setColumns(
          columns.map(col =>
            col.id === columnId
              ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
              : col
          )
        );
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDragStart = (e, task, sourceColumnId) => {
    e.dataTransfer.setData('task', JSON.stringify(task));
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    const task = JSON.parse(e.dataTransfer.getData('task'));
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (sourceColumnId === targetColumnId) return;

    try {
      setColumns(
        columns.map(col => {
          if (col.id === sourceColumnId) {
            return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
          }
          if (col.id === targetColumnId) {
            return { ...col, tasks: [...col.tasks, { ...task, status: targetColumnId }] };
          }
          return col;
        })
      );
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Erreur lors du déplacement');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <Navbar />

      <main className="kanban-main">
        {/* Header */}
        <div className="kanban-header">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="back-button"
              title="Retour au tableau de bord"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="matiere-info">
              <h1 className="matiere-title">{matiere?.nom}</h1>
              <p className="matiere-description">{matiere?.description}</p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="stats-container">
            {columns.map((col) => (
              <div key={col.id} className="stat-item">
                <span className="stat-count">{col.tasks.length}</span>
                <span className="stat-label">{col.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="kanban-board">
          {columns.map((column) => (
            <div key={column.id} className={`kanban-column ${column.color}`}>
              {/* Column Header */}
              <div className="column-header">
                <h3 className="column-title">{column.title}</h3>
                <span className="column-count">{column.tasks.length}</span>
              </div>

              <div className="px-4">
                <button
                  onClick={() => handleAddTask(column.id)}
                  className="add-task-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle tâche</span>
                </button>
              </div>

              {/* Column Content */}
              <div
                className={`column-content ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {column.tasks.length === 0 ? (
                  <div className="empty-column">
                    <Plus className="empty-icon" />
                    <p className="text-sm">Glissez des tâches ici</p>
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      columnId={column.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Tâche */}
      {showTaskModal && (
        <TaskModal
          matiereId={matiereId}
          columnId={selectedColumn}
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={() => {
            fetchMatiereAndTasks();
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

// Composant TaskCard
function TaskCard({ task, columnId, onDragStart, onDragEnd, onEdit, onDelete }) {
  const getPriorityInfo = (priority) => {
    const info = {
      HAUTE: { color: 'priority-high', label: 'Haute' },
      MOYENNE: { color: 'priority-medium', label: 'Moyenne' },
      BASSE: { color: 'priority-low', label: 'Basse' },
    };
    return info[priority] || { color: 'bg-gray-500', label: 'Non définie' };
  };

  const priorityInfo = getPriorityInfo(task.priorite);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task, columnId)}
      onDragEnd={onDragEnd}
      className="task-card"
    >
      <div className="task-header">
        <h4 className="task-title">{task.titre}</h4>
        <div className="task-actions">
          <button
            onClick={() => onEdit(task, columnId)}
            className="action-btn edit-btn"
            title="Modifier"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(task.id, columnId)}
            className="action-btn delete-btn"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="task-labels">
          {task.labels.map((label, index) => (
            <span key={index} className="task-label">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="task-footer">
        <div className="task-meta">
          <div className="meta-item">
            <div className={`priority-dot ${priorityInfo.color}`} />
            <span>{priorityInfo.label}</span>
          </div>
          
          {task.date_limite && (
            <div className="meta-item">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.date_limite).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>

        {task.temps_estime && (
          <div className="meta-item">
            <Clock className="w-3 h-3" />
            <span>{task.temps_estime}h</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant TaskModal
function TaskModal({ matiereId, columnId, task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    titre: task?.titre || '',
    description: task?.description || '',
    priorite: task?.priorite || 'MOYENNE',
    date_limite: task?.date_limite || '',
    temps_estime: task?.temps_estime || '',
    labels: task?.labels?.join(', ') || '',
    status: task?.status || columnId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const taskData = {
      ...formData,
      matiere_id: matiereId,
      labels: formData.labels.split(',').map(l => l.trim()).filter(Boolean),
    };

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
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
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button onClick={onClose} className="close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Titre *</label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="form-input"
              placeholder="Titre de la tâche..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="form-textarea"
              placeholder="Description détaillée de la tâche..."
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Priorité</label>
              <select
                value={formData.priorite}
                onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                className="form-select"
              >
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Temps estimé (heures)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={formData.temps_estime}
                onChange={(e) => setFormData({ ...formData, temps_estime: e.target.value })}
                className="form-input"
                placeholder="2"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date limite</label>
            <input
              type="date"
              value={formData.date_limite}
              onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Labels (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
              className="form-input"
              placeholder="urgent, important, révision..."
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="save-btn"
            >
              {loading ? 'Enregistrement...' : task ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}