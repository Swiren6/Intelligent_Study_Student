from app import db
from datetime import datetime, timedelta


class Planning(db.Model):
    """Modèle représentant un planning d'étude généré automatiquement"""
    
    __tablename__ = 'plannings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Informations de base
    nom = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Période du planning
    date_debut = db.Column(db.DateTime, nullable=False)
    date_fin = db.Column(db.DateTime, nullable=False)
    
    # Type et statut
    type_planning = db.Column(db.String(50), default='automatique')  # 'automatique', 'manuel', 'mixte'
    statut = db.Column(db.String(20), default='actif')  # 'actif', 'termine', 'archive', 'brouillon'
    
    # Paramètres de génération
    heures_etude_par_jour = db.Column(db.Float, default=4.0)  # Heures d'étude par jour
    jours_etude_par_semaine = db.Column(db.Integer, default=6)  # Nombre de jours d'étude par semaine
    jours_repos = db.Column(db.String(50), default='dimanche')  # Jours de repos (séparés par virgule)
    
    # Algorithme et optimisation
    algorithme_utilise = db.Column(db.String(50))  # Ex: 'greedy', 'genetic', 'ml_based'
    score_qualite = db.Column(db.Float)  # Score de qualité du planning (0-100)
    
    # Progression
    pourcentage_complete = db.Column(db.Float, default=0.0)  # 0 à 100
    sessions_completees = db.Column(db.Integer, default=0)
    sessions_total = db.Column(db.Integer, default=0)
    
    # Métadonnées
    genere_automatiquement = db.Column(db.Boolean, default=True)
    derniere_optimisation = db.Column(db.DateTime)
    nombre_modifications = db.Column(db.Integer, default=0)
    
    # Timestamps
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    sessions = db.relationship('Session', backref='planning', lazy='dynamic', cascade='all, delete-orphan')
    taches = db.relationship('Tache', backref='planning', lazy='dynamic')
    
    def __init__(self, nom, user_id, date_debut, date_fin, **kwargs):
        self.nom = nom
        self.user_id = user_id
        self.date_debut = date_debut
        self.date_fin = date_fin
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def calculer_duree_totale(self):
        """Calcule la durée totale du planning en jours"""
        delta = self.date_fin - self.date_debut
        return delta.days + 1
    
    def calculer_progression(self):
        """Calcule la progression du planning"""
        sessions_total = self.sessions.count()
        if sessions_total == 0:
            return 0.0
        
        sessions_completees = self.sessions.filter_by(completee=True).count()
        return round((sessions_completees / sessions_total) * 100, 2)
    
    def update_progression(self):
        """Met à jour la progression du planning"""
        self.sessions_total = self.sessions.count()
        self.sessions_completees = self.sessions.filter_by(completee=True).count()
        self.pourcentage_complete = self.calculer_progression()
        db.session.commit()
    
    def est_actif(self):
        """Vérifie si le planning est actif (dans la période actuelle)"""
        now = datetime.utcnow()
        return self.date_debut <= now <= self.date_fin and self.statut == 'actif'
    
    def est_termine(self):
        """Vérifie si le planning est terminé"""
        return datetime.utcnow() > self.date_fin or self.statut == 'termine'
    
    def jours_restants(self):
        """Calcule le nombre de jours restants"""
        if self.est_termine():
            return 0
        delta = self.date_fin - datetime.utcnow()
        return max(0, delta.days)
    
    def get_jours_repos_list(self):
        """Retourne les jours de repos sous forme de liste"""
        if not self.jours_repos:
            return []
        return [jour.strip().lower() for jour in self.jours_repos.split(',')]
    
    def set_jours_repos_list(self, jours_list):
        """Définit les jours de repos à partir d'une liste"""
        self.jours_repos = ', '.join(jours_list) if jours_list else ''
    
    def get_prochaine_session(self):
        """Retourne la prochaine session à venir"""
        now = datetime.utcnow()
        return self.sessions.filter(
            Session.heure_debut > now,
            Session.completee == False
        ).order_by(Session.heure_debut.asc()).first()
    
    def get_sessions_aujourdhui(self):
        """Retourne les sessions d'aujourd'hui"""
        today = datetime.utcnow().date()
        return self.sessions.filter(
            db.func.date(Session.heure_debut) == today
        ).order_by(Session.heure_debut.asc()).all()
    
    def get_sessions_semaine(self):
        """Retourne les sessions de cette semaine"""
        today = datetime.utcnow()
        start_week = today - timedelta(days=today.weekday())
        end_week = start_week + timedelta(days=6)
        
        return self.sessions.filter(
            Session.heure_debut >= start_week,
            Session.heure_debut <= end_week
        ).order_by(Session.heure_debut.asc()).all()
    
    def calculer_temps_etude_total(self):
        """Calcule le temps d'étude total planifié (en minutes)"""
        total = 0
        for session in self.sessions.all():
            if session.duree:
                total += session.duree
        return total
    
    def calculer_temps_etudie_reel(self):
        """Calcule le temps réellement étudié (en minutes)"""
        total = 0
        for session in self.sessions.filter_by(completee=True).all():
            if session.duree_reelle:
                total += session.duree_reelle
        return total
    
    def generer_statistiques(self):
        """Génère des statistiques détaillées du planning"""
        return {
            'duree_totale_jours': self.calculer_duree_totale(),
            'jours_restants': self.jours_restants(),
            'sessions_total': self.sessions_total,
            'sessions_completees': self.sessions_completees,
            'pourcentage_complete': self.pourcentage_complete,
            'temps_planifie_minutes': self.calculer_temps_etude_total(),
            'temps_etudie_reel_minutes': self.calculer_temps_etudie_reel(),
            'temps_planifie_heures': round(self.calculer_temps_etude_total() / 60, 1),
            'temps_etudie_reel_heures': round(self.calculer_temps_etudie_reel() / 60, 1),
            'score_qualite': self.score_qualite,
            'est_actif': self.est_actif(),
            'est_termine': self.est_termine()
        }
    
    def archiver(self):
        """Archive le planning"""
        self.statut = 'archive'
        db.session.commit()
    
    def activer(self):
        """Active le planning"""
        self.statut = 'actif'
        db.session.commit()
    
    def terminer(self):
        """Marque le planning comme terminé"""
        self.statut = 'termine'
        db.session.commit()
    
    def to_dict(self, include_sessions=False, include_statistiques=False):
        """Convertit le planning en dictionnaire"""
        planning_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'nom': self.nom,
            'description': self.description,
            'date_debut': self.date_debut.isoformat(),
            'date_fin': self.date_fin.isoformat(),
            'type_planning': self.type_planning,
            'statut': self.statut,
            'heures_etude_par_jour': self.heures_etude_par_jour,
            'jours_etude_par_semaine': self.jours_etude_par_semaine,
            'jours_repos': self.get_jours_repos_list(),
            'algorithme_utilise': self.algorithme_utilise,
            'score_qualite': self.score_qualite,
            'pourcentage_complete': self.pourcentage_complete,
            'sessions_completees': self.sessions_completees,
            'sessions_total': self.sessions_total,
            'genere_automatiquement': self.genere_automatiquement,
            'derniere_optimisation': self.derniere_optimisation.isoformat() if self.derniere_optimisation else None,
            'nombre_modifications': self.nombre_modifications,
            'date_creation': self.date_creation.isoformat(),
            'est_actif': self.est_actif(),
            'jours_restants': self.jours_restants()
        }
        
        if include_sessions:
            planning_dict['sessions'] = [session.to_dict() for session in self.sessions.order_by('heure_debut').all()]
        
        if include_statistiques:
            planning_dict['statistiques'] = self.generer_statistiques()
        
        return planning_dict
    
    def __repr__(self):
        return f'<Planning {self.nom}>'