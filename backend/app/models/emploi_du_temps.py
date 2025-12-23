"""
Modèle EmploiDuTemps - Représente un emploi du temps importé
"""

from app import db
from datetime import datetime


class EmploiDuTemps(db.Model):
    """Modèle représentant un emploi du temps importé"""
    
    __tablename__ = 'emplois_du_temps'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Informations du fichier
    nom_fichier = db.Column(db.String(255), nullable=False)
    fichier_pdf = db.Column(db.String(255))
    
    # Période couverte
    date_debut = db.Column(db.Date)
    date_fin = db.Column(db.Date)
    semestre = db.Column(db.String(50))
    
    # Métadonnées d'analyse
    analyse_completee = db.Column(db.Boolean, default=False)
    algorithme_utilise = db.Column(db.String(50))
    confiance_extraction = db.Column(db.Float)
    
    # Statistiques
    nombre_cours_extraits = db.Column(db.Integer, default=0)
    nombre_creneaux_libres = db.Column(db.Integer, default=0)
    heures_cours_semaine = db.Column(db.Float)
    
    # Statut
    actif = db.Column(db.Boolean, default=True)
    archive = db.Column(db.Boolean, default=False)
    
    # Timestamps
    date_import = db.Column(db.DateTime, default=datetime.utcnow)
    date_analyse = db.Column(db.DateTime)
    
    # Relations
    cours = db.relationship('Cours', backref='emploi_du_temps', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, user_id, nom_fichier, **kwargs):
        self.user_id = user_id
        self.nom_fichier = nom_fichier
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def calculer_statistiques(self):
        """Calcule et met à jour les statistiques de l'emploi du temps"""
        self.nombre_cours_extraits = self.cours.count()
        
        # Calculer les heures de cours par semaine
        total_heures = 0
        for cours in self.cours.all():
            if cours.heure_debut and cours.heure_fin:
                delta = datetime.combine(datetime.today(), cours.heure_fin) - \
                        datetime.combine(datetime.today(), cours.heure_debut)
                total_heures += delta.total_seconds() / 3600
        
        self.heures_cours_semaine = round(total_heures, 2)
        db.session.commit()
    
    def to_dict(self, include_cours=False):
        """Convertit l'emploi du temps en dictionnaire"""
        edt_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'nom_fichier': self.nom_fichier,
            'date_debut': self.date_debut.isoformat() if self.date_debut else None,
            'date_fin': self.date_fin.isoformat() if self.date_fin else None,
            'semestre': self.semestre,
            'analyse_completee': self.analyse_completee,
            'algorithme_utilise': self.algorithme_utilise,
            'confiance_extraction': self.confiance_extraction,
            'nombre_cours_extraits': self.nombre_cours_extraits,
            'nombre_creneaux_libres': self.nombre_creneaux_libres,
            'heures_cours_semaine': self.heures_cours_semaine,
            'actif': self.actif,
            'archive': self.archive,
            'date_import': self.date_import.isoformat() if self.date_import else None,
            'date_analyse': self.date_analyse.isoformat() if self.date_analyse else None
        }
        
        if include_cours:
            edt_dict['cours'] = [cours.to_dict() for cours in self.cours.order_by('jour_semaine', 'heure_debut').all()]
        
        return edt_dict
    
    def __repr__(self):
        return f'<EmploiDuTemps {self.nom_fichier}>'