from app import db
from datetime import datetime


class Matiere(db.Model):
    """Modèle représentant une matière/cours"""
    
    __tablename__ = 'matieres'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Informations de base
    nom = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20))  # Ex: "INFO301"
    description = db.Column(db.Text)
    couleur = db.Column(db.String(7), default='#3B82F6')  # Couleur hex pour l'affichage
    
    # Détails académiques
    credits = db.Column(db.Integer, default=3)
    coefficient = db.Column(db.Float, default=1.0)
    semestre = db.Column(db.String(20))  # Ex: "S5", "Semestre 1"
    
    # Examen
    date_examen = db.Column(db.DateTime)
    type_examen = db.Column(db.String(50))  # Ex: "Écrit", "Oral", "TP", "Projet"
    
    # Priorité et difficulté
    priorite = db.Column(db.Integer, default=5)  # 1 (basse) à 10 (haute)
    niveau_difficulte = db.Column(db.Integer, default=5)  # 1 (facile) à 10 (difficile)
    
    # Progression
    pourcentage_complete = db.Column(db.Float, default=0.0)  # 0 à 100
    temps_estime_total = db.Column(db.Integer)  # En minutes
    temps_etudie = db.Column(db.Integer, default=0)  # En minutes
    
    # Statut
    active = db.Column(db.Boolean, default=True)
    archivee = db.Column(db.Boolean, default=False)
    
    # Timestamps
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    taches = db.relationship('Tache', backref='matiere', lazy='dynamic', cascade='all, delete-orphan')
    sessions = db.relationship('Session', backref='matiere', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, nom, user_id, **kwargs):
        self.nom = nom
        self.user_id = user_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def calculer_progression(self):
        """Calcule la progression basée sur les tâches complétées"""
        taches_total = self.taches.count()
        if taches_total == 0:
            return 0.0
        
        taches_completees = self.taches.filter_by(etat='completee').count()
        return round((taches_completees / taches_total) * 100, 2)
    
    def update_progression(self):
        """Met à jour le pourcentage de complétion"""
        self.pourcentage_complete = self.calculer_progression()
        db.session.commit()
    
    def ajouter_temps_etudie(self, minutes):
        """Ajoute du temps d'étude à la matière"""
        self.temps_etudie += minutes
        self.update_progression()
        db.session.commit()
    
    def jours_avant_examen(self):
        """Retourne le nombre de jours avant l'examen"""
        if not self.date_examen:
            return None
        delta = self.date_examen - datetime.utcnow()
        return delta.days
    
    def est_urgent(self, seuil_jours=7):
        """Vérifie si l'examen est proche"""
        jours = self.jours_avant_examen()
        if jours is None:
            return False
        return 0 <= jours <= seuil_jours
    
    def temps_restant_estime(self):
        """Calcule le temps d'étude restant estimé"""
        if not self.temps_estime_total:
            return 0
        return max(0, self.temps_estime_total - self.temps_etudie)
    
    def to_dict(self, include_taches=False, include_sessions=False):
        """Convertit la matière en dictionnaire"""
        matiere_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'nom': self.nom,
            'code': self.code,
            'description': self.description,
            'couleur': self.couleur,
            'credits': self.credits,
            'coefficient': self.coefficient,
            'semestre': self.semestre,
            'date_examen': self.date_examen.isoformat() if self.date_examen else None,
            'type_examen': self.type_examen,
            'priorite': self.priorite,
            'niveau_difficulte': self.niveau_difficulte,
            'pourcentage_complete': self.pourcentage_complete,
            'temps_estime_total': self.temps_estime_total,
            'temps_etudie': self.temps_etudie,
            'temps_restant': self.temps_restant_estime(),
            'active': self.active,
            'archivee': self.archivee,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None,
            'jours_avant_examen': self.jours_avant_examen(),
            'est_urgent': self.est_urgent()
        }
        
        if include_taches:
            matiere_dict['taches'] = [tache.to_dict() for tache in self.taches.all()]
        
        if include_sessions:
            matiere_dict['sessions'] = [session.to_dict() for session in self.sessions.all()]
        
        return matiere_dict
    
    @staticmethod
    def get_couleurs_disponibles():
        """Retourne une liste de couleurs prédéfinies pour les matières"""
        return [
            '#3B82F6',  # Bleu
            '#10B981',  # Vert
            '#F59E0B',  # Orange
            '#EF4444',  # Rouge
            '#8B5CF6',  # Violet
            '#EC4899',  # Rose
            '#06B6D4',  # Cyan
            '#84CC16',  # Lime
            '#F97316',  # Orange foncé
            '#6366F1',  # Indigo
        ]
    
    def __repr__(self):
        return f'<Matiere {self.nom}>'