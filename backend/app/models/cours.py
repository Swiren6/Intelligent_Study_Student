"""
Modèle Cours - Représente un cours dans un emploi du temps
"""

from datetime import datetime
from app import db


class Cours(db.Model):
    """Modèle pour les cours dans l'emploi du temps"""
    
    __tablename__ = 'cours'
    __table_args__ = {'extend_existing': True}
    
    # Identifiant
    id = db.Column(db.Integer, primary_key=True)
    
    # Relations
    emploi_du_temps_id = db.Column(db.Integer, db.ForeignKey('emploi_du_temps.id'), nullable=False)
    matiere_id = db.Column(db.Integer, db.ForeignKey('matiere.id'))
    
    # Informations du cours
    nom = db.Column(db.String(200), nullable=False)
    type_cours = db.Column(db.String(50))  # 'cours', 'td', 'tp', 'examen'
    
    # Horaires
    jour_semaine = db.Column(db.String(20), nullable=False)  # 'lundi', 'mardi', etc.
    heure_debut = db.Column(db.String(5), nullable=False)  # Format HH:MM
    heure_fin = db.Column(db.String(5), nullable=False)  # Format HH:MM
    
    # Localisation
    salle = db.Column(db.String(100))
    batiment = db.Column(db.String(100))
    
    # Informations complémentaires
    professeur = db.Column(db.String(200))
    description = db.Column(db.Text)
    couleur = db.Column(db.String(7))  # Code couleur hexadécimal
    
    # Récurrence
    recurrent = db.Column(db.Boolean, default=True)
    date_debut = db.Column(db.Date)
    date_fin = db.Column(db.Date)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convertit le cours en dictionnaire"""
        return {
            'id': self.id,
            'emploi_du_temps_id': self.emploi_du_temps_id,
            'matiere_id': self.matiere_id,
            'nom': self.nom,
            'type_cours': self.type_cours,
            'jour_semaine': self.jour_semaine,
            'heure_debut': self.heure_debut,
            'heure_fin': self.heure_fin,
            'salle': self.salle,
            'batiment': self.batiment,
            'professeur': self.professeur,
            'description': self.description,
            'couleur': self.couleur,
            'recurrent': self.recurrent,
            'date_debut': self.date_debut.isoformat() if self.date_debut else None,
            'date_fin': self.date_fin.isoformat() if self.date_fin else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Cours {self.nom} - {self.jour_semaine} {self.heure_debut}>'