"""
Modèle pour les cours (séances d'une matière dans l'emploi du temps)
"""

from app import db
from datetime import datetime

class Cours(db.Model):
    """
    Représente un cours/séance dans l'emploi du temps
    """
    __tablename__ = 'cours'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Relation avec l'emploi du temps
    emploi_du_temps_id = db.Column(db.Integer, db.ForeignKey('emplois_du_temps.id'), nullable=False)
    
    # Relation avec la matière
    matiere_id = db.Column(db.Integer, db.ForeignKey('matieres.id'), nullable=False)
    
    # Informations du cours
    jour_semaine = db.Column(db.String(20), nullable=False)  # Lundi, Mardi, etc.
    heure_debut = db.Column(db.Time, nullable=False)
    heure_fin = db.Column(db.Time, nullable=False)
    salle = db.Column(db.String(50))
    type_cours = db.Column(db.String(20))  # TD, TP, Cours magistral, etc.
    professeur = db.Column(db.String(100))
    
    # Métadonnées
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convertit l'objet en dictionnaire"""
        return {
            'id': self.id,
            'emploi_du_temps_id': self.emploi_du_temps_id,
            'matiere_id': self.matiere_id,
            'matiere_nom': self.matiere.nom if self.matiere else None,
            'jour_semaine': self.jour_semaine,
            'heure_debut': self.heure_debut.strftime('%H:%M') if self.heure_debut else None,
            'heure_fin': self.heure_fin.strftime('%H:%M') if self.heure_fin else None,
            'salle': self.salle,
            'type_cours': self.type_cours,
            'professeur': self.professeur,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Cours {self.matiere.nom if self.matiere else "Unknown"} - {self.jour_semaine} {self.heure_debut}>'