import React, { useState } from 'react';
import { Clock, Calendar, Zap, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FreeSlotsList = ({ freeSlots, scheduleId }) => {
  const navigate = useNavigate();
  const [selectedSlots, setSelectedSlots] = useState([]);

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const getDayColor = (day) => {
    const colors = {
      'Lundi': 'day-lundi',
      'Mardi': 'day-mardi',
      'Mercredi': 'day-mercredi',
      'Jeudi': 'day-jeudi',
      'Vendredi': 'day-vendredi',
      'Samedi': 'day-samedi',
      'Dimanche': 'day-dimanche'
    };
    return colors[day] || 'day-default';
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;
  };

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  };

  const getDurationColor = (hours) => {
    if (hours >= 3) return 'duration-long';
    if (hours >= 1.5) return 'duration-medium';
    return 'duration-short';
  };

  const toggleSlotSelection = (slotId) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleGeneratePlanning = () => {
    // Naviguer vers la page de génération avec les créneaux sélectionnés
    navigate('/planning/generate', { 
      state: { 
        scheduleId,
        selectedSlots: selectedSlots.length > 0 ? selectedSlots : null
      } 
    });
  };

  if (!freeSlots || freeSlots.length === 0) {
    return (
      <div className="empty-free-slots">
        <AlertCircle size={48} />
        <p>Aucun créneau libre détecté</p>
        <span>L'emploi du temps semble complet ou l'analyse n'a pas pu détecter de créneaux libres</span>
      </div>
    );
  }

  // Grouper les créneaux par jour
  const slotsByDay = freeSlots.reduce((acc, slot) => {
    const day = slot.jour_semaine || 'Non spécifié';
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    return acc;
  }, {});

  // Trier les jours
  const sortedDays = Object.keys(slotsByDay).sort((a, b) => {
    const indexA = daysOfWeek.indexOf(a);
    const indexB = daysOfWeek.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Calculer les statistiques
  const totalSlots = freeSlots.length;
  const totalHours = freeSlots.reduce((sum, slot) => 
    sum + calculateDuration(slot.heure_debut, slot.heure_fin), 0
  );
  const avgDuration = totalHours / totalSlots;
  const longSlots = freeSlots.filter(slot => 
    calculateDuration(slot.heure_debut, slot.heure_fin) >= 2
  ).length;

  return (
    <div className="free-slots-container">
      {/* En-tête avec statistiques */}
      <div className="free-slots-header">
        <div className="header-content">
          <h3>Créneaux libres disponibles</h3>
          <p>Utilisez ces créneaux pour générer votre planning d'étude automatique</p>
        </div>

        <div className="slots-stats">
          <div className="stat-item">
            <Calendar size={20} />
            <div>
              <span className="stat-value">{totalSlots}</span>
              <span className="stat-label">créneaux</span>
            </div>
          </div>

          <div className="stat-item">
            <Clock size={20} />
            <div>
              <span className="stat-value">{formatDuration(totalHours)}</span>
              <span className="stat-label">disponibles</span>
            </div>
          </div>

          <div className="stat-item">
            <Zap size={20} />
            <div>
              <span className="stat-value">{longSlots}</span>
              <span className="stat-label">créneaux longs (2h+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de génération */}
      <div className="generate-section">
        <button 
          className="btn-generate-planning"
          onClick={handleGeneratePlanning}
        >
          <Zap size={20} />
          Générer mon planning d'étude
          <ArrowRight size={20} />
        </button>

        {selectedSlots.length > 0 && (
          <p className="selected-info">
            <CheckCircle size={16} />
            {selectedSlots.length} créneau{selectedSlots.length > 1 ? 'x' : ''} sélectionné{selectedSlots.length > 1 ? 's' : ''}
          </p>
        )}

        <p className="generate-hint">
          Sélectionnez des créneaux spécifiques ou générez un planning avec tous les créneaux disponibles
        </p>
      </div>

      {/* Liste des créneaux par jour */}
      {sortedDays.map(day => (
        <div key={day} className="day-section">
          <div className={`day-header ${getDayColor(day)}`}>
            <h4>{day}</h4>
            <span className="slots-count">
              {slotsByDay[day].length} créneau{slotsByDay[day].length > 1 ? 'x' : ''} · {' '}
              {formatDuration(
                slotsByDay[day].reduce((sum, slot) => 
                  sum + calculateDuration(slot.heure_debut, slot.heure_fin), 0
                )
              )}
            </span>
          </div>

          <div className="slots-grid">
            {slotsByDay[day]
              .sort((a, b) => (a.heure_debut || '').localeCompare(b.heure_debut || ''))
              .map((slot, index) => {
                const duration = calculateDuration(slot.heure_debut, slot.heure_fin);
                const slotId = `${day}-${index}`;
                const isSelected = selectedSlots.includes(slotId);

                return (
                  <div 
                    key={slotId}
                    className={`free-slot-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSlotSelection(slotId)}
                  >
                    <div className="slot-checkbox">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="slot-content">
                      <div className="slot-time">
                        <Clock size={18} />
                        <span className="time-range">
                          {slot.heure_debut || 'N/A'} - {slot.heure_fin || 'N/A'}
                        </span>
                      </div>

                      <div className={`slot-duration ${getDurationColor(duration)}`}>
                        <span className="duration-badge">
                          {formatDuration(duration)}
                        </span>
                        {duration >= 2 && (
                          <span className="duration-label">Idéal pour étude approfondie</span>
                        )}
                        {duration >= 1 && duration < 2 && (
                          <span className="duration-label">Bon pour révisions</span>
                        )}
                        {duration < 1 && (
                          <span className="duration-label">Court - révisions rapides</span>
                        )}
                      </div>

                      {slot.type && (
                        <div className="slot-type">
                          <span className="type-badge">{slot.type}</span>
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="slot-selected-indicator">
                        <CheckCircle size={20} />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Pied de page avec conseils */}
      <div className="free-slots-footer">
        <div className="tips-section">
          <h5>💡 Conseils d'utilisation</h5>
          <ul>
            <li>Les créneaux de 2h+ sont idéaux pour un apprentissage approfondi</li>
            <li>Les créneaux de 1-2h conviennent aux révisions et exercices</li>
            <li>Utilisez les courts créneaux pour revoir vos notes ou flashcards</li>
            <li>Le planning généré optimisera automatiquement la répartition de vos matières</li>
          </ul>
        </div>

        <div className="cta-section">
          <p>Prêt à optimiser votre temps d'étude ?</p>
          <button 
            className="btn-cta"
            onClick={handleGeneratePlanning}
          >
            <Zap size={18} />
            Créer mon planning maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeSlotsList;