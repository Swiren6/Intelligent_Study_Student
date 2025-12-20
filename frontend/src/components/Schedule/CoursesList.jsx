import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, Clock, MapPin, Book } from 'lucide-react';

const CoursesList = ({ courses, onUpdateCourse, onDeleteCourse, isEditable = true }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nom_matiere: '',
    jour_semaine: '',
    heure_debut: '',
    heure_fin: '',
    salle: '',
    type_cours: ''
  });

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const courseTypes = ['Cours', 'TD', 'TP', 'Examen', 'Séminaire', 'Autre'];

  const handleEdit = (course) => {
    setEditingId(course.id);
    setEditForm({
      nom_matiere: course.nom_matiere || '',
      jour_semaine: course.jour_semaine || '',
      heure_debut: course.heure_debut || '',
      heure_fin: course.heure_fin || '',
      salle: course.salle || '',
      type_cours: course.type_cours || 'Cours'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nom_matiere: '',
      jour_semaine: '',
      heure_debut: '',
      heure_fin: '',
      salle: '',
      type_cours: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.nom_matiere || !editForm.jour_semaine || !editForm.heure_debut || !editForm.heure_fin) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    await onUpdateCourse(editingId, editForm);
    handleCancelEdit();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      await onDeleteCourse(id);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Cours': 'type-cours',
      'TD': 'type-td',
      'TP': 'type-tp',
      'Examen': 'type-exam',
      'Séminaire': 'type-seminar',
      'Autre': 'type-other'
    };
    return colors[type] || 'type-other';
  };

  const getDayColor = (day) => {
    const colors = {
      'Lundi': 'day-lundi',
      'Mardi': 'day-mardi',
      'Mercredi': 'day-mercredi',
      'Jeudi': 'day-jeudi',
      'Vendredi': 'day-vendredi',
      'Samedi': 'day-samedi'
    };
    return colors[day] || 'day-default';
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="empty-courses">
        <Book size={48} />
        <p>Aucun cours extrait</p>
        <span>Les cours détectés apparaîtront ici après l'analyse</span>
      </div>
    );
  }

  // Grouper les cours par jour
  const coursesByDay = courses.reduce((acc, course) => {
    const day = course.jour_semaine || 'Non spécifié';
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(course);
    return acc;
  }, {});

  // Trier les jours selon l'ordre de la semaine
  const sortedDays = Object.keys(coursesByDay).sort((a, b) => {
    const indexA = daysOfWeek.indexOf(a);
    const indexB = daysOfWeek.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="courses-list-container">
      <div className="courses-header">
        <h3>Cours extraits ({courses.length})</h3>
        {isEditable && (
          <p className="courses-hint">
            Cliquez sur <Edit2 size={14} /> pour modifier un cours
          </p>
        )}
      </div>

      {sortedDays.map(day => (
        <div key={day} className="day-section">
          <div className={`day-header ${getDayColor(day)}`}>
            <h4>{day}</h4>
            <span className="course-count">{coursesByDay[day].length} cours</span>
          </div>

          <div className="courses-grid">
            {coursesByDay[day]
              .sort((a, b) => (a.heure_debut || '').localeCompare(b.heure_fin || ''))
              .map(course => (
                <div key={course.id} className="course-card">
                  {editingId === course.id ? (
                    // Mode édition
                    <div className="course-edit-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Matière *</label>
                          <input
                            type="text"
                            value={editForm.nom_matiere}
                            onChange={(e) => setEditForm({ ...editForm, nom_matiere: e.target.value })}
                            placeholder="Ex: Mathématiques"
                          />
                        </div>

                        <div className="form-group">
                          <label>Type *</label>
                          <select
                            value={editForm.type_cours}
                            onChange={(e) => setEditForm({ ...editForm, type_cours: e.target.value })}
                          >
                            {courseTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Jour *</label>
                          <select
                            value={editForm.jour_semaine}
                            onChange={(e) => setEditForm({ ...editForm, jour_semaine: e.target.value })}
                          >
                            <option value="">Sélectionner...</option>
                            {daysOfWeek.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Heure début *</label>
                          <input
                            type="time"
                            value={editForm.heure_debut}
                            onChange={(e) => setEditForm({ ...editForm, heure_debut: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Heure fin *</label>
                          <input
                            type="time"
                            value={editForm.heure_fin}
                            onChange={(e) => setEditForm({ ...editForm, heure_fin: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Salle</label>
                          <input
                            type="text"
                            value={editForm.salle}
                            onChange={(e) => setEditForm({ ...editForm, salle: e.target.value })}
                            placeholder="Ex: Salle 101"
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button 
                          className="btn-save"
                          onClick={handleSaveEdit}
                        >
                          <Check size={16} />
                          Enregistrer
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={handleCancelEdit}
                        >
                          <X size={16} />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <>
                      <div className="course-header-row">
                        <div className="course-title">
                          <h5>{course.nom_matiere || 'Sans nom'}</h5>
                          <span className={`course-type-badge ${getTypeColor(course.type_cours)}`}>
                            {course.type_cours || 'Cours'}
                          </span>
                        </div>

                        {isEditable && (
                          <div className="course-actions">
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => handleEdit(course)}
                              title="Modifier"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDelete(course.id)}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="course-details">
                        <div className="course-info">
                          <Clock size={16} />
                          <span>{course.heure_debut || 'N/A'} - {course.heure_fin || 'N/A'}</span>
                        </div>

                        {course.salle && (
                          <div className="course-info">
                            <MapPin size={16} />
                            <span>{course.salle}</span>
                          </div>
                        )}
                      </div>

                      {course.confidence_score !== undefined && (
                        <div className="course-confidence">
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill"
                              style={{ 
                                width: `${course.confidence_score * 100}%`,
                                backgroundColor: course.confidence_score > 0.7 ? '#10b981' : 
                                               course.confidence_score > 0.4 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="confidence-label">
                            Confiance: {Math.round(course.confidence_score * 100)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursesList;