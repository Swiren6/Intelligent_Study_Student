from app import db
from datetime import datetime, timedelta


class Session(db.Model):
    """Modèle représentant une session d'étude planifiée"""
    
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    planning_id = db.Column(db.Integer, db.ForeignKey('plannings.id'), nullable=False)
    matiere_id = db.Column(db.Integer, db.ForeignKey('matieres.id'))
    
    # Informations temporelles
    date = db.Column(db.Date, nullable=False)
    heure_debut = db.Column(db.DateTime, nullable=False)
    heure_fin = db.Column(db.DateTime, nullable=False)
    duree = db.Column(db.Integer)  # Durée planifiée en minutes
    
    # Informations de la session
    titre = db.Column(db.String(200))
    description = db.Column(db.Text)
    type_session = db.Column(db.String(50), default='revision')  # 'revision', 'exercice', 'projet', 'lecture'
    
    # Tâche associée
    tache_associee_id = db.Column(db.Integer, db.ForeignKey('taches.id'))
    tache_associee = db.relationship('Tache', foreign_keys=[tache_associee_id])
    
    # État et progression
    completee = db.Column(db.Boolean, default=False)
    en_cours = db.Column(db.Boolean, default=False)
    annulee = db.Column(db.Boolean, default=False)
    
    # Temps réel
    heure_debut_reelle = db.Column(db.DateTime)
    heure_fin_reelle = db.Column(db.DateTime)
    duree_reelle = db.Column(db.Integer)  # Durée réelle en minutes
    
    # Évaluation et notes
    productivite = db.Column(db.Integer)  # 1 à 5
    niveau_concentration = db.Column(db.Integer)  # 1 à 5
    niveau_difficulte_ressenti = db.Column(db.Integer)  # 1 à 5
    notes_session = db.Column(db.Text)  # Notes de l'étudiant après la session
    
    # Rappel
    rappel_envoye = db.Column(db.Boolean, default=False)
    date_rappel = db.Column(db.DateTime)
    
    # Métadonnées
    genere_auto = db.Column(db.Boolean, default=True)
    modifie_manuellement = db.Column(db.Boolean, default=False)
    
    # Timestamps
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, planning_id, heure_debut, heure_fin, **kwargs):
        self.planning_id = planning_id
        self.heure_debut = heure_debut
        self.heure_fin = heure_fin
        self.date = heure_debut.date()
        self.duree = int((heure_fin - heure_debut).total_seconds() / 60)
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def demarrer_session(self):
        """Démarre la session"""
        self.en_cours = True
        self.heure_debut_reelle = datetime.utcnow()
        db.session.commit()
    
    def terminer_session(self):
        """Termine la session"""
        self.en_cours = False
        self.completee = True
        self.heure_fin_reelle = datetime.utcnow()
        
        # Calculer la durée réelle
        if self.heure_debut_reelle:
            delta = self.heure_fin_reelle - self.heure_debut_reelle
            self.duree_reelle = int(delta.total_seconds() / 60)
        
        # Mettre à jour la progression du planning
        if self.planning:
            self.planning.update_progression()
        
        # Ajouter le temps à la matière si associée
        if self.matiere and self.duree_reelle:
            self.matiere.ajouter_temps_etudie(self.duree_reelle)
        
        db.session.commit()
    
    def annuler_session(self, raison=None):
        """Annule la session"""
        self.annulee = True
        self.en_cours = False
        if raison:
            self.notes_session = f"Annulée: {raison}"
        db.session.commit()
    
    def evaluer_session(self, productivite, concentration, difficulte, notes=None):
        """Évalue la session après complétion"""
        self.productivite = productivite
        self.niveau_concentration = concentration
        self.niveau_difficulte_ressenti = difficulte
        if notes:
            self.notes_session = notes
        db.session.commit()
    
    def est_passee(self):
        """Vérifie si la session est passée"""
        return datetime.utcnow() > self.heure_fin
    
    def est_en_cours_time(self):
        """Vérifie si nous sommes dans la plage horaire de la session"""
        now = datetime.utcnow()
        return self.heure_debut <= now <= self.heure_fin
    
    def est_a_venir(self):
        """Vérifie si la session est à venir"""
        return datetime.utcnow() < self.heure_debut
    
    def minutes_avant_debut(self):
        """Calcule le nombre de minutes avant le début"""
        if not self.est_a_venir():
            return 0
        delta = self.heure_debut - datetime.utcnow()
        return int(delta.total_seconds() / 60)
    
    def doit_envoyer_rappel(self, minutes_avant=30):
        """Vérifie si un rappel doit être envoyé"""
        if self.rappel_envoye or self.completee or self.annulee:
            return False
        
        minutes = self.minutes_avant_debut()
        return 0 < minutes <= minutes_avant
    
    def calculer_ecart_temps(self):
        """Calcule l'écart entre temps planifié et temps réel"""
        if not self.duree_reelle or not self.duree:
            return None
        return self.duree_reelle - self.duree
    
    def calculer_taux_completion(self):
        """Calcule le taux de complétion (temps réel / temps planifié)"""
        if not self.duree_reelle or not self.duree or self.duree == 0:
            return None
        return round((self.duree_reelle / self.duree) * 100, 2)
    
    def get_statut(self):
        """Retourne le statut actuel de la session"""
        if self.annulee:
            return 'annulee'
        if self.completee:
            return 'completee'
        if self.en_cours:
            return 'en_cours'
        if self.est_passee():
            return 'manquee'
        if self.est_en_cours_time():
            return 'en_cours_temps'
        if self.est_a_venir():
            return 'a_venir'
        return 'inconnue'
    
    def to_dict(self, include_matiere=False, include_planning=False):
        """Convertit la session en dictionnaire"""
        session_dict = {
            'id': self.id,
            'planning_id': self.planning_id,
            'matiere_id': self.matiere_id,
            'date': self.date.isoformat() if self.date else None,
            'heure_debut': self.heure_debut.isoformat(),
            'heure_fin': self.heure_fin.isoformat(),
            'duree': self.duree,
            'titre': self.titre,
            'description': self.description,
            'type_session': self.type_session,
            'tache_associee_id': self.tache_associee_id,
            'completee': self.completee,
            'en_cours': self.en_cours,
            'annulee': self.annulee,
            'heure_debut_reelle': self.heure_debut_reelle.isoformat() if self.heure_debut_reelle else None,
            'heure_fin_reelle': self.heure_fin_reelle.isoformat() if self.heure_fin_reelle else None,
            'duree_reelle': self.duree_reelle,
            'productivite': self.productivite,
            'niveau_concentration': self.niveau_concentration,
            'niveau_difficulte_ressenti': self.niveau_difficulte_ressenti,
            'notes_session': self.notes_session,
            'rappel_envoye': self.rappel_envoye,
            'genere_auto': self.genere_auto,
            'modifie_manuellement': self.modifie_manuellement,
            'statut': self.get_statut(),
            'est_passee': self.est_passee(),
            'est_a_venir': self.est_a_venir(),
            'minutes_avant_debut': self.minutes_avant_debut() if self.est_a_venir() else None,
            'ecart_temps': self.calculer_ecart_temps(),
            'taux_completion': self.calculer_taux_completion()
        }
        
        if include_matiere and self.matiere:
            session_dict['matiere'] = {
                'id': self.matiere.id,
                'nom': self.matiere.nom,
                'couleur': self.matiere.couleur
            }
        
        if include_planning and self.planning:
            session_dict['planning'] = {
                'id': self.planning.id,
                'nom': self.planning.nom
            }
        
        return session_dict
    
    def __repr__(self):
        return f'<Session {self.titre or "Sans titre"} - {self.heure_debut}>'