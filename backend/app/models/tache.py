from app import db
from datetime import datetime


class Tache(db.Model):
    """Modèle représentant une tâche d'étude ou un examen"""
    
    __tablename__ = 'taches'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    matiere_id = db.Column(db.Integer, db.ForeignKey('matieres.id'))
    
    # Informations de base
    titre = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type_tache = db.Column(db.String(50), default='revision')  # 'revision', 'exercice', 'projet', 'examen', 'lecture'
    
    # Dates et échéances
    date_limite = db.Column(db.DateTime)
    date_debut = db.Column(db.DateTime, default=datetime.utcnow)
    date_completion = db.Column(db.DateTime)
    
    # Priorité et difficulté
    priorite = db.Column(db.Integer, default=5)  # 1 (basse) à 10 (haute)
    niveau_difficulte = db.Column(db.Integer, default=5)  # 1 (facile) à 10 (difficile)
    
    # Temps
    duree_estimee = db.Column(db.Integer)  # En minutes
    temps_passe = db.Column(db.Integer, default=0)  # En minutes
    
    # Statut et état
    etat = db.Column(db.String(20), default='a_faire')  # 'a_faire', 'en_cours', 'completee', 'annulee'
    pourcentage_complete = db.Column(db.Float, default=0.0)  # 0 à 100
    
    # Tags et notes
    tags = db.Column(db.String(200))  # Tags séparés par des virgules
    notes = db.Column(db.Text)  # Notes personnelles
    
    # Rappels
    rappel_active = db.Column(db.Boolean, default=True)
    minutes_avant_rappel = db.Column(db.Integer, default=30)  # Minutes avant la date limite
    
    # Timestamps
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    planning_id = db.Column(db.Integer, db.ForeignKey('plannings.id'))
    
    def __init__(self, titre, user_id, **kwargs):
        self.titre = titre
        self.user_id = user_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def marquer_completee(self):
        """Marque la tâche comme complétée"""
        self.etat = 'completee'
        self.pourcentage_complete = 100.0
        self.date_completion = datetime.utcnow()
        
        # Mettre à jour la progression de la matière associée
        if self.matiere:
            self.matiere.update_progression()
            if self.temps_passe > 0:
                self.matiere.ajouter_temps_etudie(self.temps_passe)
        
        db.session.commit()
    
    def marquer_en_cours(self):
        """Marque la tâche comme en cours"""
        self.etat = 'en_cours'
        if self.pourcentage_complete == 0:
            self.pourcentage_complete = 10.0
        db.session.commit()
    
    def annuler(self):
        """Annule la tâche"""
        self.etat = 'annulee'
        db.session.commit()
    
    def ajouter_temps(self, minutes):
        """Ajoute du temps passé sur la tâche"""
        self.temps_passe += minutes
        
        # Mettre à jour le pourcentage si une durée estimée existe
        if self.duree_estimee and self.duree_estimee > 0:
            self.pourcentage_complete = min(100.0, (self.temps_passe / self.duree_estimee) * 100)
        
        db.session.commit()
    
    def est_en_retard(self):
        """Vérifie si la tâche est en retard"""
        if not self.date_limite or self.etat == 'completee':
            return False
        return datetime.utcnow() > self.date_limite
    
    def jours_restants(self):
        """Calcule le nombre de jours restants avant la date limite"""
        if not self.date_limite:
            return None
        delta = self.date_limite - datetime.utcnow()
        return delta.days
    
    def heures_restantes(self):
        """Calcule le nombre d'heures restantes avant la date limite"""
        if not self.date_limite:
            return None
        delta = self.date_limite - datetime.utcnow()
        return round(delta.total_seconds() / 3600, 1)
    
    def est_urgente(self, seuil_heures=48):
        """Vérifie si la tâche est urgente"""
        heures = self.heures_restantes()
        if heures is None or self.etat == 'completee':
            return False
        return 0 <= heures <= seuil_heures
    
    def calculer_score_priorite(self):
        """
        Calcule un score de priorité dynamique basé sur:
        - Priorité définie
        - Temps restant
        - Difficulté
        - État d'avancement
        """
        score = self.priorite * 10
        
        # Ajuster selon l'urgence
        heures = self.heures_restantes()
        if heures is not None:
            if heures < 24:
                score += 50
            elif heures < 48:
                score += 30
            elif heures < 72:
                score += 20
        
        # Ajuster selon la difficulté
        score += self.niveau_difficulte * 5
        
        # Réduire selon l'avancement
        score -= self.pourcentage_complete * 0.5
        
        return round(score, 2)
    
    def get_tags_list(self):
        """Retourne les tags sous forme de liste"""
        if not self.tags:
            return []
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
    
    def set_tags_list(self, tags_list):
        """Définit les tags à partir d'une liste"""
        self.tags = ', '.join(tags_list) if tags_list else ''
    
    def to_dict(self, include_matiere=False):
        """Convertit la tâche en dictionnaire"""
        tache_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'matiere_id': self.matiere_id,
            'titre': self.titre,
            'description': self.description,
            'type_tache': self.type_tache,
            'date_limite': self.date_limite.isoformat() if self.date_limite else None,
            'date_debut': self.date_debut.isoformat() if self.date_debut else None,
            'date_completion': self.date_completion.isoformat() if self.date_completion else None,
            'priorite': self.priorite,
            'niveau_difficulte': self.niveau_difficulte,
            'duree_estimee': self.duree_estimee,
            'temps_passe': self.temps_passe,
            'etat': self.etat,
            'pourcentage_complete': self.pourcentage_complete,
            'tags': self.get_tags_list(),
            'notes': self.notes,
            'rappel_active': self.rappel_active,
            'minutes_avant_rappel': self.minutes_avant_rappel,
            'date_creation': self.date_creation.isoformat() if self.date_creation else None,
            'est_en_retard': self.est_en_retard(),
            'jours_restants': self.jours_restants(),
            'heures_restantes': self.heures_restantes(),
            'est_urgente': self.est_urgente(),
            'score_priorite': self.calculer_score_priorite()
        }
        
        if include_matiere and self.matiere:
            tache_dict['matiere'] = {
                'id': self.matiere.id,
                'nom': self.matiere.nom,
                'couleur': self.matiere.couleur
            }
        
        return tache_dict
    
    @staticmethod
    def get_types_disponibles():
        """Retourne la liste des types de tâches disponibles"""
        return ['revision', 'exercice', 'projet', 'examen', 'lecture', 'tp', 'presentation']
    
    def __repr__(self):
        return f'<Tache {self.titre}>'