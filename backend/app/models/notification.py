from app import db
from datetime import datetime


class Notification(db.Model):
    """Modèle représentant une notification ou rappel"""
    
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Type et contenu
    type_notification = db.Column(db.String(50), nullable=False)  # 'session', 'tache', 'examen', 'systeme'
    titre = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    
    # Références
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'))
    tache_id = db.Column(db.Integer, db.ForeignKey('taches.id'))
    matiere_id = db.Column(db.Integer, db.ForeignKey('matieres.id'))
    
    # Statut
    lue = db.Column(db.Boolean, default=False)
    envoyee = db.Column(db.Boolean, default=False)
    archivee = db.Column(db.Boolean, default=False)
    
    # Priorité
    priorite = db.Column(db.String(20), default='normale')  # 'basse', 'normale', 'haute', 'urgente'
    
    # Timing
    date_envoi = db.Column(db.DateTime, nullable=False)
    date_envoi_reelle = db.Column(db.DateTime)
    date_lecture = db.Column(db.DateTime)
    
    # Canal de notification
    canal = db.Column(db.String(20), default='web')  # 'web', 'mobile', 'email'
    
    # Actions
    action_url = db.Column(db.String(200))  # URL de redirection si l'utilisateur clique
    action_label = db.Column(db.String(100))  # Label du bouton d'action
    
    # Métadonnées
    metadata_json = db.Column(db.Text)  # Données additionnelles en JSON
    
    # Timestamps
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    session = db.relationship('Session', foreign_keys=[session_id])
    tache = db.relationship('Tache', foreign_keys=[tache_id])
    matiere = db.relationship('Matiere', foreign_keys=[matiere_id])
    
    def __init__(self, user_id, type_notification, titre, message, date_envoi, **kwargs):
        self.user_id = user_id
        self.type_notification = type_notification
        self.titre = titre
        self.message = message
        self.date_envoi = date_envoi
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def marquer_lue(self):
        """Marque la notification comme lue"""
        if not self.lue:
            self.lue = True
            self.date_lecture = datetime.utcnow()
            db.session.commit()
    
    def marquer_envoyee(self):
        """Marque la notification comme envoyée"""
        if not self.envoyee:
            self.envoyee = True
            self.date_envoi_reelle = datetime.utcnow()
            db.session.commit()
    
    def archiver(self):
        """Archive la notification"""
        self.archivee = True
        db.session.commit()
    
    def doit_etre_envoyee(self):
        """Vérifie si la notification doit être envoyée maintenant"""
        if self.envoyee or self.archivee:
            return False
        return datetime.utcnow() >= self.date_envoi
    
    def est_expiree(self, heures=24):
        """Vérifie si la notification est expirée"""
        if not self.date_envoi:
            return False
        delta = datetime.utcnow() - self.date_envoi
        return delta.total_seconds() > (heures * 3600)
    
    def to_dict(self, include_relations=False):
        """Convertit la notification en dictionnaire"""
        notif_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'type_notification': self.type_notification,
            'titre': self.titre,
            'message': self.message,
            'session_id': self.session_id,
            'tache_id': self.tache_id,
            'matiere_id': self.matiere_id,
            'lue': self.lue,
            'envoyee': self.envoyee,
            'archivee': self.archivee,
            'priorite': self.priorite,
            'date_envoi': self.date_envoi.isoformat(),
            'date_envoi_reelle': self.date_envoi_reelle.isoformat() if self.date_envoi_reelle else None,
            'date_lecture': self.date_lecture.isoformat() if self.date_lecture else None,
            'canal': self.canal,
            'action_url': self.action_url,
            'action_label': self.action_label,
            'date_creation': self.date_creation.isoformat()
        }
        
        if include_relations:
            if self.session:
                notif_dict['session'] = {
                    'id': self.session.id,
                    'titre': self.session.titre,
                    'heure_debut': self.session.heure_debut.isoformat()
                }
            
            if self.tache:
                notif_dict['tache'] = {
                    'id': self.tache.id,
                    'titre': self.tache.titre,
                    'date_limite': self.tache.date_limite.isoformat() if self.tache.date_limite else None
                }
            
            if self.matiere:
                notif_dict['matiere'] = {
                    'id': self.matiere.id,
                    'nom': self.matiere.nom,
                    'couleur': self.matiere.couleur
                }
        
        return notif_dict
    
    @staticmethod
    def creer_notification_session(user_id, session, minutes_avant=30):
        """Crée une notification pour une session à venir"""
        from datetime import timedelta
        
        date_envoi = session.heure_debut - timedelta(minutes=minutes_avant)
        
        titre = f"Session d'étude dans {minutes_avant} minutes"
        message = f"Votre session '{session.titre or 'Sans titre'}' commence bientôt."
        
        if session.matiere:
            message += f" Matière: {session.matiere.nom}"
        
        notification = Notification(
            user_id=user_id,
            type_notification='session',
            titre=titre,
            message=message,
            date_envoi=date_envoi,
            session_id=session.id,
            matiere_id=session.matiere_id,
            priorite='normale',
            action_url=f'/planning/{session.planning_id}',
            action_label='Voir le planning'
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @staticmethod
    def creer_notification_tache(user_id, tache, heures_avant=24):
        """Crée une notification pour une tâche proche de sa deadline"""
        from datetime import timedelta
        
        if not tache.date_limite:
            return None
        
        date_envoi = tache.date_limite - timedelta(hours=heures_avant)
        
        if date_envoi < datetime.utcnow():
            return None
        
        titre = f"Tâche à compléter dans {heures_avant}h"
        message = f"La tâche '{tache.titre}' doit être complétée bientôt."
        
        if tache.matiere:
            message += f" Matière: {tache.matiere.nom}"
        
        priorite = 'urgente' if heures_avant <= 6 else 'haute' if heures_avant <= 24 else 'normale'
        
        notification = Notification(
            user_id=user_id,
            type_notification='tache',
            titre=titre,
            message=message,
            date_envoi=date_envoi,
            tache_id=tache.id,
            matiere_id=tache.matiere_id,
            priorite=priorite,
            action_url=f'/taches/{tache.id}',
            action_label='Voir la tâche'
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @staticmethod
    def creer_notification_examen(user_id, matiere, jours_avant=7):
        """Crée une notification pour un examen à venir"""
        from datetime import timedelta
        
        if not matiere.date_examen:
            return None
        
        date_envoi = matiere.date_examen - timedelta(days=jours_avant)
        
        if date_envoi < datetime.utcnow():
            return None
        
        titre = f"Examen dans {jours_avant} jour{'s' if jours_avant > 1 else ''}"
        message = f"L'examen de {matiere.nom} approche. Avez-vous préparé votre révision ?"
        
        priorite = 'urgente' if jours_avant <= 2 else 'haute' if jours_avant <= 7 else 'normale'
        
        notification = Notification(
            user_id=user_id,
            type_notification='examen',
            titre=titre,
            message=message,
            date_envoi=date_envoi,
            matiere_id=matiere.id,
            priorite=priorite,
            action_url=f'/matieres/{matiere.id}',
            action_label='Voir la matière'
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    def __repr__(self):
        return f'<Notification {self.type_notification} - {self.titre}>'