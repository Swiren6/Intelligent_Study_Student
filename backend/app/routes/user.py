from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.utils.decorators import jwt_required_custom, admin_required, validate_json, handle_validation_error
from app.utils.validators import (
    validate_string, validate_email, validate_integer, 
    validate_time, validate_choice, ValidationError
)
from app.utils.helpers import success_response, error_response

bp = Blueprint('user', __name__)


@bp.route('', methods=['GET'])
@admin_required
def get_all_users(current_user):
    """
    Récupère la liste de tous les utilisateurs (admin uniquement)
    """
    try:
        users = User.query.all()
        
        return success_response(
            data=[user.to_dict() for user in users],
            message=f"{len(users)} utilisateur{'s' if len(users) > 1 else ''} trouvé{'s' if len(users) > 1 else ''}"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['GET'])
@jwt_required_custom
def get_user(id, current_user):
    """
    Récupère un utilisateur par son ID
    Les utilisateurs peuvent voir leur propre profil, les admins peuvent tout voir
    """
    try:
        # Vérifier les permissions
        if current_user.role != 'admin' and current_user.id != id:
            return error_response(
                'Accès refusé',
                'Vous ne pouvez voir que votre propre profil',
                403
            )
        
        user = User.query.get(id)
        
        if not user:
            return error_response('Utilisateur introuvable', f'Aucun utilisateur avec l\'ID {id}', 404)
        
        return success_response(data=user.to_dict(include_stats=True))
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['PUT'])
@jwt_required_custom
@validate_json(
    optional_fields=['nom', 'niveau', 'langue', 'heure_productive_debut', 
                    'heure_productive_fin', 'duree_session_preferee', 'duree_pause']
)
@handle_validation_error
def update_user(id, current_user, data):
    """
    Met à jour un utilisateur
    Les utilisateurs peuvent modifier leur propre profil, les admins peuvent tout modifier
    """
    try:
        # Vérifier les permissions
        if current_user.role != 'admin' and current_user.id != id:
            return error_response(
                'Accès refusé',
                'Vous ne pouvez modifier que votre propre profil',
                403
            )
        
        user = User.query.get(id)
        
        if not user:
            return error_response('Utilisateur introuvable', f'Aucun utilisateur avec l\'ID {id}', 404)
        
        # Validation et mise à jour des champs
        if 'nom' in data:
            validate_string(data['nom'], 'Nom', min_length=2, max_length=100)
            user.nom = data['nom'].strip()
        
        if 'niveau' in data:
            if data['niveau']:
                validate_string(data['niveau'], 'Niveau', max_length=50)
                user.niveau = data['niveau'].strip()
            else:
                user.niveau = None
        
        if 'langue' in data:
            validate_choice(data['langue'], 'Langue', ['fr', 'en'])
            user.langue = data['langue']
        
        if 'heure_productive_debut' in data:
            user.heure_productive_debut = validate_time(data['heure_productive_debut'], 'Heure productive début')
        
        if 'heure_productive_fin' in data:
            user.heure_productive_fin = validate_time(data['heure_productive_fin'], 'Heure productive fin')
        
        if 'duree_session_preferee' in data:
            validate_integer(data['duree_session_preferee'], 'Durée session préférée', min_value=15, max_value=300)
            user.duree_session_preferee = data['duree_session_preferee']
        
        if 'duree_pause' in data:
            validate_integer(data['duree_pause'], 'Durée pause', min_value=5, max_value=60)
            user.duree_pause = data['duree_pause']
        
        db.session.commit()
        
        return success_response(
            data=user.to_dict(include_stats=True),
            message='Profil mis à jour avec succès'
        )
        
    except ValidationError as e:
        return error_response('Erreur de validation', str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_user(id, current_user):
    """
    Supprime un utilisateur (admin uniquement)
    """
    try:
        user = User.query.get(id)
        
        if not user:
            return error_response('Utilisateur introuvable', f'Aucun utilisateur avec l\'ID {id}', 404)
        
        # Empêcher la suppression de son propre compte
        if user.id == current_user.id:
            return error_response(
                'Action interdite',
                'Vous ne pouvez pas supprimer votre propre compte',
                400
            )
        
        db.session.delete(user)
        db.session.commit()
        
        return success_response(message='Utilisateur supprimé avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/deactivate', methods=['POST'])
@admin_required
def deactivate_user(id, current_user):
    """
    Désactive un utilisateur (admin uniquement)
    """
    try:
        user = User.query.get(id)
        
        if not user:
            return error_response('Utilisateur introuvable', f'Aucun utilisateur avec l\'ID {id}', 404)
        
        if user.id == current_user.id:
            return error_response(
                'Action interdite',
                'Vous ne pouvez pas désactiver votre propre compte',
                400
            )
        
        user.actif = False
        db.session.commit()
        
        return success_response(message='Utilisateur désactivé avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/activate', methods=['POST'])
@admin_required
def activate_user(id, current_user):
    """
    Active un utilisateur (admin uniquement)
    """
    try:
        user = User.query.get(id)
        
        if not user:
            return error_response('Utilisateur introuvable', f'Aucun utilisateur avec l\'ID {id}', 404)
        
        user.actif = True
        db.session.commit()
        
        return success_response(message='Utilisateur activé avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/preferences', methods=['GET'])
@jwt_required_custom
def get_preferences(id, current_user):
    """
    Récupère les préférences d'un utilisateur
    """
    try:
        if current_user.role != 'admin' and current_user.id != id:
            return error_response(
                'Accès refusé',
                'Vous ne pouvez voir que vos propres préférences',
                403
            )
        
        user = User.query.get(id)
        
        if not user:
            return error_response('Utilisateur introuvable', f'Aucun utilisateur avec l\'ID {id}', 404)
        
        preferences = {
            'heure_productive_debut': user.heure_productive_debut.strftime('%H:%M') if user.heure_productive_debut else None,
            'heure_productive_fin': user.heure_productive_fin.strftime('%H:%M') if user.heure_productive_fin else None,
            'duree_session_preferee': user.duree_session_preferee,
            'duree_pause': user.duree_pause,
            'niveau': user.niveau,
            'langue': user.langue
        }
        
        return success_response(data=preferences)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/statistics', methods=['GET'])
@jwt_required_custom
def get_statistics(id, current_user):
    """
    Récupère les statistiques d'un utilisateur
    """
    try:
        if current_user.role != 'admin' and current_user.id != id:
            return error_response(
                'Accès refusé',
                'Vous ne pouvez voir que vos propres statistiques',
                403
            )
        
        user = User.query.get(id)
        
        if not user:
            return error_response('Utilisateur introuvable', f'Aucun utilisateur avec l\'ID {id}', 404)
        
        stats = {
            'nombre_matieres': user.matieres.count(),
            'nombre_taches': user.taches.count(),
            'taches_completees': user.taches.filter_by(etat='completee').count(),
            'taches_en_cours': user.taches.filter_by(etat='en_cours').count(),
            'taches_a_faire': user.taches.filter_by(etat='a_faire').count(),
            'nombre_plannings': user.plannings.count(),
            'plannings_actifs': user.plannings.filter_by(statut='actif').count(),
            'notifications_non_lues': user.notifications.filter_by(lue=False).count()
        }
        
        # Calculer le temps total d'étude
        temps_total = 0
        for matiere in user.matieres:
            temps_total += matiere.temps_etudie or 0
        
        stats['temps_total_etudie_minutes'] = temps_total
        stats['temps_total_etudie_heures'] = round(temps_total / 60, 1)
        
        return success_response(data=stats)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/search', methods=['GET'])
@admin_required
def search_users(current_user):
    """
    Recherche des utilisateurs (admin uniquement)
    Query params: q (search term), role, actif
    """
    try:
        query = User.query
        
        # Recherche par terme
        search_term = request.args.get('q', '').strip()
        if search_term:
            query = query.filter(
                (User.nom.ilike(f'%{search_term}%')) |
                (User.email.ilike(f'%{search_term}%'))
            )
        
        # Filtrer par rôle
        role = request.args.get('role')
        if role:
            query = query.filter_by(role=role)
        
        # Filtrer par statut actif
        actif = request.args.get('actif')
        if actif is not None:
            actif_bool = actif.lower() in ['true', '1', 'yes']
            query = query.filter_by(actif=actif_bool)
        
        users = query.all()
        
        return success_response(
            data=[user.to_dict() for user in users],
            message=f"{len(users)} utilisateur{'s' if len(users) > 1 else ''} trouvé{'s' if len(users) > 1 else ''}"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)