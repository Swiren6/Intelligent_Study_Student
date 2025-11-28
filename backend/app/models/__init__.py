"""
Initialisation du package models
Import de tous les modèles pour faciliter leur utilisation
"""

from app.models.user import User
from app.models.matiere import Matiere
from app.models.tache import Tache
from app.models.planning import Planning
from app.models.session import Session
from app.models.notification import Notification
from app.models.emploi_du_temps import EmploiDuTemps
from app.models.cours import Cours

__all__ = [
    'User',
    'Matiere',
    'Tache',
    'Planning',
    'Session',
    'Notification',
    'EmploiDuTemps',
    'Cours'
]