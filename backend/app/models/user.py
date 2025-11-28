from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import re


class User(db.Model):
    """Modèle représentant un utilisateur (étudiant ou administrateur)"""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    mot_de_passe = db.Column(db.String(255), nullable=False)
    
    # Profil étudiant
    niveau = db.Column(db.String(50))  # Ex: "Licence 3", "Master 1"
    langue = db.Column(db.String(10), default='fr')  # 'fr' ou 'en'
    
    # Préférences de productivité
    heure_productive_debut = db.Column(db.Time, default=datetime.strptime('08:00', '%H:%M').time())
    heure_productive_fin = db.Column(db.Time, default=datetime.strptime('22:00', '%H:%M').time())
    duree_session_preferee = db.Column(db.Integer, default=60)  # en minutes
    duree_pause = db.Column(db.Integer, default=15)  # en minutes
    
    # Rôle et statut
    role = db.Column(db.String(20), default='etudiant')  # 'etudiant' ou 'admin'
    actif = db.Column(db.Boolean, default=True)
    
    # Timestamps
    date_inscription = db.Column(db.DateTime, default=datetime.utcnow)
    derniere_connexion = db.Column(db.DateTime)
    
    # Relations
    matieres = db.relationship('Matiere', backref='etudiant', lazy='dynamic', cascade='all, delete-orphan')
    taches = db.relationship('Tache', backref='etudiant', lazy='dynamic', cascade='all, delete-orphan')
    plannings = db.relationship('Planning', backref='etudiant', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='etudiant', lazy='dynamic', cascade='all, delete-orphan')
    emplois_du_temps = db.relationship('EmploiDuTemps', backref='etudiant', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, nom, email, mot_de_passe, **kwargs):
        self.nom = nom
        self.email = email.lower()
        self.set_password(mot_de_passe)
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def set_password(self, password):
        """Hash et stocke le mot de passe"""
        self.mot_de_passe = generate_password_hash(password)
    
    def check_password(self, password):
        """Vérifie le mot de passe"""
        return check_password_hash(self.mot_de_passe, password)
    
    @staticmethod
    def validate_email(email):
        """Valide le format de l'email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password):
        """
        Valide le mot de passe:
        - Au moins 8 caractères
        - Au moins une lettre majuscule
        - Au moins une lettre minuscule
        - Au moins un chiffre
        """
        if len(password) < 8:
            return False, "Le mot de passe doit contenir au moins 8 caractères"
        if not re.search(r'[A-Z]', password):
            return False, "Le mot de passe doit contenir au moins une lettre majuscule"
        if not re.search(r'[a-z]', password):
            return False, "Le mot de passe doit contenir au moins une lettre minuscule"
        if not re.search(r'\d', password):
            return False, "Le mot de passe doit contenir au moins un chiffre"
        return True, "Mot de passe valide"
    
    def to_dict(self, include_stats=False):
        """Convertit l'utilisateur en dictionnaire"""
        user_dict = {
            'id': self.id,
            'nom': self.nom,
            'email': self.email,
            'niveau': self.niveau,
            'langue': self.langue,
            'role': self.role,
            'actif': self.actif,
            'preferences': {
                'heure_productive_debut': self.heure_productive_debut.strftime('%H:%M') if self.heure_productive_debut else None,
                'heure_productive_fin': self.heure_productive_fin.strftime('%H:%M') if self.heure_productive_fin else None,
                'duree_session_preferee': self.duree_session_preferee,
                'duree_pause': self.duree_pause
            },
            'date_inscription': self.date_inscription.isoformat() if self.date_inscription else None,
            'derniere_connexion': self.derniere_connexion.isoformat() if self.derniere_connexion else None
        }
        
        if include_stats:
            user_dict['statistiques'] = {
                'nombre_matieres': self.matieres.count(),
                'nombre_taches': self.taches.count(),
                'nombre_plannings': self.plannings.count(),
                'taches_completees': self.taches.filter_by(etat='completee').count()
            }
        
        return user_dict
    
    def update_derniere_connexion(self):
        """Met à jour la date de dernière connexion"""
        self.derniere_connexion = datetime.utcnow()
        db.session.commit()
    
    def __repr__(self):
        return f'<User {self.email}>'