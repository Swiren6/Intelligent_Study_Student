from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import config
import logging
from logging.handlers import RotatingFileHandler
import os

# Initialisation des extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()


def create_app(config_name='default'):
    """Factory pour créer l'application Flask"""
    
    app = Flask(__name__)
    
    # Chargement de la configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialisation des extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Configuration du logging
    if not app.debug and not app.testing:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/study_assistant.log',
                                          maxBytes=10240000, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Study Assistant startup')
    
    # Enregistrement des blueprints (routes)
    from app.routes import auth, user, matiere, planning, pdf_routes, notification, services_routes
    
    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(user, url_prefix='/api/users')
    app.register_blueprint(matiere, url_prefix='/api/matieres')
    app.register_blueprint(planning, url_prefix='/api/planning')
    app.register_blueprint(pdf_routes, url_prefix='/api/pdf')
    app.register_blueprint(notification, url_prefix='/api/notifications')
    app.register_blueprint(services_routes, url_prefix='/api/services')
    
    # Route de santé
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'API is running'}, 200
    
    # Route principale
    @app.route('/')
    def index():
        return {
            'message': 'Bienvenue sur l\'API Assistant Intelligent d\'Organisation des Études',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth',
                'users': '/api/users',
                'matieres': '/api/matieres',
                'planning': '/api/planning',
                'pdf': '/api/pdf',
                'notifications': '/api/notifications',
                'services': '/api/services'
            }
        }, 200
    
    # Gestion des erreurs JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            'error': 'Token expiré',
            'message': 'Le token a expiré. Veuillez vous reconnecter.'
        }, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            'error': 'Token invalide',
            'message': 'La vérification du token a échoué.'
        }, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            'error': 'Token manquant',
            'message': 'Token d\'authentification requis.'
        }, 401
    
    return app