"""
Modèle pour l'emploi du temps
"""

from app import db
from datetime import datetime

class EmploiDuTemps(db.Model):
    """
    Représente l'emploi du temps d'un utilisateur
    """
    __tablename__ = 'emplois_du_temps'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Informations sur l'emploi du temps
    nom = db.Column(db.String(100), nullable=False)
    semestre = db.Column(db.String(50))
    annee_scolaire = db.Column(db.String(20))
    
    # Dates de validité
    date_debut = db.Column(db.Date)
    date_fin = db.Column(db.Date)
    
    # Source du fichier
    fichier_source = db.Column(db.String(255))  # Nom du fichier PDF uploadé
    
    # Statut
    active = db.Column(db.Boolean, default=True)
    
    # Métadonnées
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    cours = db.relationship('Cours', backref='emploi_du_temps', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_cours=False):
        """Convertit l'objet en dictionnaire"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'nom': self.nom,
            'semestre': self.semestre,
            'annee_scolaire': self.annee_scolaire,
            'date_debut': self.date_debut.isoformat() if self.date_debut else None,
            'date_fin': self.date_fin.isoformat() if self.date_fin else None,
            'fichier_source': self.fichier_source,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_cours:
            data['cours'] = [cours.to_dict() for cours in self.cours.all()]
            data['nb_cours'] = self.cours.count()
        
        return data
    
    def __repr__(self):
        return f'<EmploiDuTemps {self.nom} - {self.semestre}>'