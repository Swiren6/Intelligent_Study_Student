"""
Décorateurs personnalisés pour les routes
"""

from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models.user import User
from app.utils.validators import ValidationError


def jwt_required_custom(fn):
    """
    Décorateur personnalisé pour vérifier le JWT et charger l'utilisateur
    Ajoute l'utilisateur courant à kwargs
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user or not current_user.actif:
                return jsonify({
                    'error': 'Utilisateur introuvable ou désactivé'
                }), 401
            
            kwargs['current_user'] = current_user
            return fn(*args, **kwargs)
            
        except Exception as e:
            return jsonify({
                'error': 'Authentification invalide',
                'message': str(e)
            }), 401
    
    return wrapper


def admin_required(fn):
    """
    Décorateur pour vérifier que l'utilisateur est admin
    """
    @wraps(fn)
    @jwt_required_custom
    def wrapper(*args, **kwargs):
        current_user = kwargs.get('current_user')
        
        if not current_user or current_user.role != 'admin':
            return jsonify({
                'error': 'Accès refusé',
                'message': 'Vous devez être administrateur pour accéder à cette ressource'
            }), 403
        
        return fn(*args, **kwargs)
    
    return wrapper


def validate_json(required_fields=None, optional_fields=None):
    """
    Décorateur pour valider le JSON de la requête
    
    Args:
        required_fields (list): Liste des champs requis
        optional_fields (list): Liste des champs optionnels
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({
                    'error': 'Content-Type invalide',
                    'message': 'La requête doit être en JSON'
                }), 400
            
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'error': 'Données manquantes',
                    'message': 'Le corps de la requête ne peut pas être vide'
                }), 400
            
            # Vérifier les champs requis
            if required_fields:
                missing = [field for field in required_fields if field not in data]
                if missing:
                    return jsonify({
                        'error': 'Champs manquants',
                        'message': f"Champs requis manquants: {', '.join(missing)}"
                    }), 400
            
            # Vérifier les champs inconnus
            if optional_fields is not None:
                all_fields = set(required_fields or []) | set(optional_fields or [])
                unknown = [field for field in data.keys() if field not in all_fields]
                if unknown:
                    return jsonify({
                        'error': 'Champs invalides',
                        'message': f"Champs non autorisés: {', '.join(unknown)}"
                    }), 400
            
            kwargs['data'] = data
            return fn(*args, **kwargs)
        
        return wrapper
    return decorator


def handle_validation_error(fn):
    """
    Décorateur pour gérer les erreurs de validation
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except ValidationError as e:
            return jsonify({
                'error': 'Erreur de validation',
                'message': str(e)
            }), 400
        except ValueError as e:
            return jsonify({
                'error': 'Valeur invalide',
                'message': str(e)
            }), 400
    
    return wrapper


def paginate(default_per_page=20, max_per_page=100):
    """
    Décorateur pour ajouter la pagination aux routes
    Ajoute page, per_page, offset aux kwargs
    
    Args:
        default_per_page (int): Nombre d'éléments par page par défaut
        max_per_page (int): Nombre maximum d'éléments par page
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                page = int(request.args.get('page', 1))
                per_page = int(request.args.get('per_page', default_per_page))
                
                if page < 1:
                    page = 1
                
                if per_page < 1:
                    per_page = default_per_page
                
                if per_page > max_per_page:
                    per_page = max_per_page
                
                offset = (page - 1) * per_page
                
                kwargs['page'] = page
                kwargs['per_page'] = per_page
                kwargs['offset'] = offset
                
                return fn(*args, **kwargs)
                
            except ValueError:
                return jsonify({
                    'error': 'Paramètres de pagination invalides',
                    'message': 'page et per_page doivent être des entiers'
                }), 400
        
        return wrapper
    return decorator


def rate_limit(max_requests=100, window_seconds=3600):
    """
    Décorateur simple de rate limiting
    (En production, utiliser Redis ou Flask-Limiter)
    
    Args:
        max_requests (int): Nombre maximum de requêtes
        window_seconds (int): Fenêtre de temps en secondes
    """
    # Simple implementation sans Redis pour le développement
    # En production, utiliser Redis + Flask-Limiter
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # TODO: Implémenter avec Redis en production
            return fn(*args, **kwargs)
        
        return wrapper
    return decorator


def require_ownership(model_class, param_name='id', foreign_key='user_id'):
    """
    Décorateur pour vérifier que l'utilisateur possède la ressource
    
    Args:
        model_class: Classe du modèle à vérifier
        param_name (str): Nom du paramètre URL contenant l'ID
        foreign_key (str): Nom de la clé étrangère dans le modèle
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required_custom
        def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            resource_id = kwargs.get(param_name)
            
            if not resource_id:
                return jsonify({
                    'error': 'ID manquant',
                    'message': f'Le paramètre {param_name} est requis'
                }), 400
            
            resource = model_class.query.get(resource_id)
            
            if not resource:
                return jsonify({
                    'error': 'Ressource introuvable',
                    'message': f'{model_class.__name__} introuvable'
                }), 404
            
            # Vérifier la propriété (sauf pour les admins)
            if current_user.role != 'admin':
                if not hasattr(resource, foreign_key):
                    return jsonify({
                        'error': 'Configuration invalide',
                        'message': f'Le modèle {model_class.__name__} n\'a pas de champ {foreign_key}'
                    }), 500
                
                if getattr(resource, foreign_key) != current_user.id:
                    return jsonify({
                        'error': 'Accès refusé',
                        'message': 'Vous n\'avez pas accès à cette ressource'
                    }), 403
            
            kwargs['resource'] = resource
            return fn(*args, **kwargs)
        
        return wrapper
    return decorator


def log_request(fn):
    """
    Décorateur pour logger les requêtes
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        from flask import current_app
        current_app.logger.info(f"{request.method} {request.path} - User: {get_jwt_identity() if request.headers.get('Authorization') else 'Anonymous'}")
        return fn(*args, **kwargs)
    
    return wrapper


def cache_response(timeout=300):
    """
    Décorateur pour cacher les réponses
    (Simple implementation, en production utiliser Redis)
    
    Args:
        timeout (int): Durée du cache en secondes
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # TODO: Implémenter avec Redis en production
            return fn(*args, **kwargs)
        
        return wrapper
    return decorator


def cors_preflight(fn):
    """
    Décorateur pour gérer les requêtes OPTIONS (CORS preflight)
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
        return fn(*args, **kwargs)
    
    return wrapper