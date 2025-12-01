import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import { useAPI } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import API_CONFIG from '../config/api.config';

import '../styles/MatiereTasksPage.css';

export default function MatiereTasksPage() {
  const { matiereId } = useParams();
  const navigate = useNavigate();
  const api = useAPI();
  const { showSuccess, showError } = useToast();
  
  const [subject, setSubject] = useState(null);
  const [columns, setColumns] = useState([
    { id: 'A_FAIRE', title: 'À faire', color: 'column-todo', tasks: [] },
    { id: 'EN_COURS', title: 'En cours', color: 'column-in_progress', tasks: [] },
    { id: 'EN_REVISION', title: 'En révision', color: 'column-review', tasks: [] },
    { id: 'TERMINE', title: 'Terminé', color: 'column-done', tasks: [] },
  ]);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    fetchSubjectAndTasks();
  }, [matiereId]);

  const fetchSubjectAndTasks = async () => {
    setLoading(true);
    try {
      // Récupérer la matière
      const subjectResult = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.BY_ID(matiereId));
      if (subjectResult.success) {
        setSubject(subjectResult.data.subject || subjectResult.data);
      }

      // Récupérer les tâches
      const tasksResult = await api.get(API_CONFIG.ENDPOINTS.TASKS.BY_SUBJECT(matiereId));
      if (tasksResult.success) {
        const tasks = tasksResult.data.tasks || tasksResult.data;
        
        // Organiser les tâches par colonne
        const updatedColumns = columns.map(col => ({
          ...col,
          tasks: tasks.filter(task => task.statut === col.id)
        }));
        setColumns(updatedColumns);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Erreur lors du chargement des données');
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
        const result = await api.del(API_CONFIG.ENDPOINTS.TASKS.DELETE(taskId));
        
        if (result.success) {
          setColumns(
            columns.map(col =>
              col.id === columnId
                ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                : col
            )
          );
          showSuccess('Tâche supprimée avec succès');
        } else {
          showError('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        showError('Erreur lors de la suppression');
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
      // Mettre à jour le statut dans le backend
      const result = await api.patch(
        API_CONFIG.ENDPOINTS.TASKS.UPDATE_STATUS(task.id),
        { statut: targetColumnId }
      );

      if (result.success) {
        setColumns(
          columns.map(col => {
            if (col.id === sourceColumnId) {
              return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
            }
            if (col.id === targetColumnId) {
              return { ...col, tasks: [...col.tasks, { ...task, statut: targetColumnId }] };
            }
            return col;
          })
        );
        showSuccess('Statut mis à jour');
      } else {
        showError('Erreur lors du déplacement');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Erreur lors du déplacement');
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
              <h1 className="matiere-title">{subject?.nom}</h1>
              <p className="matiere-description">{subject?.description}</p>
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
          subjectId={matiereId}
          columnId={selectedColumn}
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={() => {
            fetchSubjectAndTasks();
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
function TaskModal({ subjectId, columnId, task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    titre: task?.titre || '',
    description: task?.description || '',
    priorite: task?.priorite || 'MOYENNE',
    date_limite: task?.date_limite || '',
    temps_estime: task?.temps_estime || '',
    labels: task?.labels?.join(', ') || '',
    statut: task?.statut || columnId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const api = useAPI();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const taskData = {
      ...formData,
      matiere_id: parseInt(subjectId),
      labels: formData.labels.split(',').map(l => l.trim()).filter(Boolean),
      temps_estime: parseFloat(formData.temps_estime) || null,
    };

    try {
      let result;
      
      if (task) {
        result = await api.put(API_CONFIG.ENDPOINTS.TASKS.UPDATE(task.id), taskData);
      } else {
        result = await api.post(API_CONFIG.ENDPOINTS.TASKS.CREATE, taskData);
      }
      
      if (result.success) {
        showSuccess(task ? 'Tâche modifiée avec succès' : 'Tâche créée avec succès');
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