import { useState } from 'react';
//import api from '../utils/api'; // Décommentez cette ligne
import API_CONFIG from '../config/api.config';
import { useToast } from '../context/ToastContext';
import '../styles/create-task-form.css'; // Import du CSS

export default function CreateTaskForm({ matiereId, userId, onSuccess, onCancel }) {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type_tache: 'revision',
    date_limite: '',
    priorite: 5,
    niveau_difficulte: 5,
    duree_estimee: '',
    tags: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setFormData(fd => ({ ...fd, tags: value }));
    
    // Convertir en tableau pour l'affichage
    if (value.trim() === '') {
      setTags([]);
    } else {
      setTags(value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''));
    }
  };

  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    setFormData(fd => ({ ...fd, tags: newTags.join(', ') }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    // Préparation du payload
    const payload = {
      ...formData,
      user_id: userId,
      matiere_id: matiereId,
      priorite: Number(formData.priorite),
      niveau_difficulte: Number(formData.niveau_difficulte),
      duree_estimee: formData.duree_estimee ? Number(formData.duree_estimee) : null,
      tags: formData.tags,
    };

    try {
      const res = await api.post(API_CONFIG.ENDPOINTS.TASKS.CREATE, payload);
      if (res.success) {
        showSuccess('Tâche créée avec succès');
        onSuccess && onSuccess();
      } else {
        showError(res.error || 'Erreur lors de la création');
      }
    } catch (error) {
      showError(error.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-form-container">
      <div className="form-header">
        <h2>Créer une nouvelle tâche</h2>
        <p>Remplissez les informations ci-dessous pour créer une nouvelle tâche</p>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-task-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="required">Titre</label>
            <input
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleChange}
              required
              placeholder="Titre de la tâche"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Type de tâche</label>
            <select
              name="type_tache"
              value={formData.type_tache}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              <option value="revision">Révision</option>
              <option value="exercice">Exercice</option>
              <option value="projet">Projet</option>
              <option value="examen">Examen</option>
              <option value="lecture">Lecture</option>
              <option value="tp">TP</option>
              <option value="presentation">Présentation</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description de la tâche (optionnelle)"
            className="form-textarea"
            disabled={loading}
            rows="3"
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Date limite</label>
            <input
              name="date_limite"
              type="date"
              value={formData.date_limite}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Durée estimée (minutes)</label>
            <input
              name="duree_estimee"
              type="number"
              min="1"
              value={formData.duree_estimee}
              onChange={handleChange}
              placeholder="ex: 60"
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Priorité (1 à 10)</label>
            <div className="range-container">
              <input
                name="priorite"
                type="range"
                min="1"
                max="10"
                value={formData.priorite}
                onChange={handleChange}
                className="range-slider"
                disabled={loading}
              />
              <span className="range-value">{formData.priorite}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Difficulté (1 à 10)</label>
            <div className="range-container">
              <input
                name="niveau_difficulte"
                type="range"
                min="1"
                max="10"
                value={formData.niveau_difficulte}
                onChange={handleChange}
                className="range-slider"
                disabled={loading}
              />
              <span className="range-value">{formData.niveau_difficulte}</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-input-container">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="tag-remove"
                  disabled={loading}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleTagsChange}
              placeholder="Saisir des tags séparés par des virgules"
              className="tags-input"
              disabled={loading}
            />
          </div>
          <small className="text-gray-500 dark:text-gray-400">
            Séparez les tags par des virgules (ex: urgent, important, examen)
          </small>
        </div>

        <div className="form-group">
          <label>Notes personnelles</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes additionnelles (optionnel)"
            className="form-textarea"
            disabled={loading}
            rows="2"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={loading}
            className="form-button cancel"
          >
            Annuler
          </button>
          <button  
            type="submit" 
            disabled={loading}
            className="form-button submit"
          >
            {loading ? 'Création en cours...' : 'Créer la tâche'}
          </button>
        </div>
      </form>
    </div>
  );
}