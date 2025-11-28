from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from datetime import datetime, timedelta

bp = Blueprint('auth', __name__)


@bp.route('/register', methods=['POST'])
def register():
    """
    Inscription d'un nouvel utilisateur
    
    Body JSON:
    {
        "nom": "John Doe",
        "email": "john@example.com",
        "mot_de_passe": "Password123",
        "niveau": "Licence 3" (optionnel),
        "langue": "fr" (optionnel)
    }
    """
    try:
        data = request.get_json()
        
        # Validation des champs requis
        if not data or not all(key in data for key in ['nom', 'email', 'mot_de_passe']):
            return jsonify({
                'error': 'Champs manquants',
                'message': 'Nom, email et mot de passe sont requis'
            }), 400
        
        nom = data.get('nom', '').strip()
        email = data.get('email', '').strip().lower()
        mot_de_passe = data.get('mot_de_passe')
        
        # Validation du nom
        if len(nom) < 2:
            return jsonify({
                'error': 'Nom invalide',
                'message': 'Le nom doit contenir au moins 2 caractères'
            }), 400
        
        # Validation de l'email
        if not User.validate_email(email):
            return jsonify({
                'error': 'Email invalide',
                'message': 'Veuillez fournir un email valide'
            }), 400
        
        # Vérifier si l'utilisateur existe déjà
        if User.query.filter_by(email=email).first():
            return jsonify({
                'error': 'Email déjà utilisé',
                'message': 'Un compte existe déjà avec cet email'
            }), 409
        
        # Validation du mot de passe
        is_valid, message = User.validate_password(mot_de_passe)
        if not is_valid:
            return jsonify({
                'error': 'Mot de passe invalide',
                'message': message
            }), 400
        
        # Créer le nouvel utilisateur
        new_user = User(
            nom=nom,
            email=email,
            mot_de_passe=mot_de_passe,
            niveau=data.get('niveau'),
            langue=data.get('langue', 'fr')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Générer les tokens
        access_token = create_access_token(identity=new_user.id)
        refresh_token = create_refresh_token(identity=new_user.id)
        
        return jsonify({
            'message': 'Inscription réussie',
            'user': new_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Erreur serveur',
            'message': str(e)
        }), 500


@bp.route('/login', methods=['POST'])
def login():
    """
    Connexion d'un utilisateur
    
    Body JSON:
    {
        "email": "john@example.com",
        "mot_de_passe": "Password123"
    }
    """
    try:
        data = request.get_json()
        
        # Validation des champs
        if not data or not all(key in data for key in ['email', 'mot_de_passe']):
            return jsonify({
                'error': 'Champs manquants',
                'message': 'Email et mot de passe sont requis'
            }), 400
        
        email = data.get('email', '').strip().lower()
        mot_de_passe = data.get('mot_de_passe')
        
        # Rechercher l'utilisateur
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({
                'error': 'Identifiants invalides',
                'message': 'Email ou mot de passe incorrect'
            }), 401
        
        # Vérifier le mot de passe
        if not user.check_password(mot_de_passe):
            return jsonify({
                'error': 'Identifiants invalides',
                'message': 'Email ou mot de passe incorrect'
            }), 401
        
        # Vérifier si le compte est actif
        if not user.actif:
            return jsonify({
                'error': 'Compte désactivé',
                'message': 'Votre compte a été désactivé. Contactez l\'administrateur.'
            }), 403
        
        # Mettre à jour la dernière connexion
        user.update_derniere_connexion()
        
        # Générer les tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Connexion réussie',
            'user': user.to_dict(include_stats=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur serveur',
            'message': str(e)
        }), 500


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Rafraîchit le token d'accès avec un refresh token
    
    Headers:
    Authorization: Bearer <refresh_token>
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Vérifier que l'utilisateur existe toujours
        user = User.query.get(current_user_id)
        if not user or not user.actif:
            return jsonify({
                'error': 'Utilisateur introuvable ou désactivé',
                'message': 'Veuillez vous reconnecter'
            }), 401
        
        # Générer un nouveau token d'accès
        access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur serveur',
            'message': str(e)
        }), 500


@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Déconnexion de l'utilisateur
    (Dans une implémentation complète, on ajouterait le token à une blacklist)
    
    Headers:
    Authorization: Bearer <access_token>
    """
    try:
        # Dans une version production, on ajouterait le token à une blacklist Redis
        # jti = get_jwt()["jti"]
        # redis_client.set(jti, "", ex=ACCESS_EXPIRES)
        
        return jsonify({
            'message': 'Déconnexion réussie'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur serveur',
            'message': str(e)
        }), 500


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Récupère les informations de l'utilisateur connecté
    
    Headers:
    Authorization: Bearer <access_token>
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'error': 'Utilisateur introuvable',
                'message': 'L\'utilisateur n\'existe pas'
            }), 404
        
        return jsonify({
            'user': user.to_dict(include_stats=True)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur serveur',
            'message': str(e)
        }), 500


@bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """
    Change le mot de passe de l'utilisateur
    
    Headers:
    Authorization: Bearer <access_token>
    
    Body JSON:
    {
        "ancien_mot_de_passe": "OldPassword123",
        "nouveau_mot_de_passe": "NewPassword123"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'error': 'Utilisateur introuvable'
            }), 404
        
        data = request.get_json()
        
        if not data or not all(key in data for key in ['ancien_mot_de_passe', 'nouveau_mot_de_passe']):
            return jsonify({
                'error': 'Champs manquants',
                'message': 'Ancien et nouveau mot de passe requis'
            }), 400
        
        # Vérifier l'ancien mot de passe
        if not user.check_password(data['ancien_mot_de_passe']):
            return jsonify({
                'error': 'Mot de passe incorrect',
                'message': 'L\'ancien mot de passe est incorrect'
            }), 401
        
        # Valider le nouveau mot de passe
        is_valid, message = User.validate_password(data['nouveau_mot_de_passe'])
        if not is_valid:
            return jsonify({
                'error': 'Nouveau mot de passe invalide',
                'message': message
            }), 400
        
        # Changer le mot de passe
        user.set_password(data['nouveau_mot_de_passe'])
        db.session.commit()
        
        return jsonify({
            'message': 'Mot de passe modifié avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Erreur serveur',
            'message': str(e)
        }), 500


@bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """
    Vérifie si le token est valide
    
    Headers:
    Authorization: Bearer <access_token>
    """
    try:
        current_user_id = get_jwt_identity()
        jwt_data = get_jwt()
        
        user = User.query.get(current_user_id)
        if not user or not user.actif:
            return jsonify({
                'valid': False,
                'message': 'Utilisateur introuvable ou désactivé'
            }), 401
        
        return jsonify({
            'valid': True,
            'user_id': current_user_id,
            'expires_at': jwt_data.get('exp')
        }), 200
        
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 401