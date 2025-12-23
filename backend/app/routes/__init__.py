"""
Initialisation du package routes
"""

from app.routes.auth import bp as auth
from app.routes.user import bp as user
from app.routes.matiere import bp as matiere
from app.routes.planning import bp as planning
from app.routes.pdf_routes import bp as pdf_routes
from app.routes.notification import bp as notification
from app.routes.services_routes import bp as services_routes

__all__ = [
    'auth',
    'user',
    'matiere',
    'planning',
    'pdf_routes',
    'notification',
    'services_routes'
]
