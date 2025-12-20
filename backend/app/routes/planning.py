from flask import Blueprint, request, jsonify
from app import db
from app.models.planning import Planning
from app.models.session import Session
from app.utils.decorators import jwt_required_custom, validate_json, handle_validation_error
from app.utils.validators import (
    validate_string, validate_datetime, validate_integer,
    validate_float, validate_choice, ValidationError
)
from app.utils.helpers import success_response, error_response
from datetime import datetime

bp = Blueprint('planning', __name__)


@bp.route('', methods=['GET'])
@jwt_required_custom
def get_plannings(current_user):
    """
    Récupère tous les plannings de l'utilisateur
    Query params: statut, type_planning
    """
    try:
        query = Planning.query.filter_by(user_id=current_user.id)
        
        # Filtres
        statut = request.args.get('statut')
        if statut:
            query = query.filter_by(statut=statut)
        
        type_planning = request.args.get('type_planning')
        if type_planning:
            query = query.filter_by(type_planning=type_planning)
        
        # Tri par date de création (plus récent d'abord)
        plannings = query.order_by(Planning.date_creation.desc()).all()
        
        return success_response(
            data=[planning.to_dict() for planning in plannings],
            message=f"{len(plannings)} planning(s) trouvé(s)"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['GET'])
@jwt_required_custom
def get_planning(id, current_user):
    """Récupère un planning par son ID"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        # Options d'inclusion
        include_sessions = request.args.get('include_sessions', 'false').lower() == 'true'
        include_stats = request.args.get('include_statistiques', 'false').lower() == 'true'
        
        return success_response(
            data=planning.to_dict(include_sessions=include_sessions, include_statistiques=include_stats)
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('', methods=['POST'])
@jwt_required_custom
@validate_json(
    required_fields=['nom', 'date_debut', 'date_fin'],
    optional_fields=['description', 'type_planning', 'heures_etude_par_jour',
                    'jours_etude_par_semaine', 'jours_repos']
)
@handle_validation_error
def create_planning(current_user, data):
    """Crée un nouveau planning"""
    try:
        # Validation
        validate_string(data['nom'], 'Nom', min_length=2, max_length=200)
        date_debut = validate_datetime(data['date_debut'], 'Date début')
        date_fin = validate_datetime(data['date_fin'], 'Date fin')
        
        # Vérifier que date_fin > date_debut
        if date_fin <= date_debut:
            raise ValidationError('La date de fin doit être postérieure à la date de début')
        
        # Créer le planning
        planning = Planning(
            nom=data['nom'].strip(),
            user_id=current_user.id,
            date_debut=date_debut,
            date_fin=date_fin
        )
        
        # Champs optionnels
        if 'description' in data:
            planning.description = data['description']
        
        if 'type_planning' in data:
            validate_choice(data['type_planning'], 'Type planning', ['automatique', 'manuel', 'mixte'])
            planning.type_planning = data['type_planning']
        
        if 'heures_etude_par_jour' in data:
            validate_float(data['heures_etude_par_jour'], 'Heures étude par jour', min_value=0.5, max_value=16.0)
            planning.heures_etude_par_jour = data['heures_etude_par_jour']
        
        if 'jours_etude_par_semaine' in data:
            validate_integer(data['jours_etude_par_semaine'], 'Jours étude par semaine', min_value=1, max_value=7)
            planning.jours_etude_par_semaine = data['jours_etude_par_semaine']
        
        if 'jours_repos' in data:
            if isinstance(data['jours_repos'], list):
                planning.set_jours_repos_list(data['jours_repos'])
            else:
                planning.jours_repos = data['jours_repos']
        
        db.session.add(planning)
        db.session.commit()
        
        return success_response(
            data=planning.to_dict(),
            message='Planning créé avec succès',
            status_code=201
        )
        
    except ValidationError as e:
        return error_response('Erreur de validation', str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['PUT'])
@jwt_required_custom
@validate_json(
    optional_fields=['nom', 'description', 'date_debut', 'date_fin', 'statut',
                    'heures_etude_par_jour', 'jours_etude_par_semaine', 'jours_repos']
)
@handle_validation_error
def update_planning(id, current_user, data):
    """Met à jour un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        # Mise à jour des champs
        if 'nom' in data:
            validate_string(data['nom'], 'Nom', min_length=2, max_length=200)
            planning.nom = data['nom'].strip()
        
        if 'description' in data:
            planning.description = data['description']
        
        if 'date_debut' in data:
            date_debut = validate_datetime(data['date_debut'], 'Date début')
            if planning.date_fin and date_debut >= planning.date_fin:
                raise ValidationError('La date de début doit être antérieure à la date de fin')
            planning.date_debut = date_debut
        
        if 'date_fin' in data:
            date_fin = validate_datetime(data['date_fin'], 'Date fin')
            if date_fin <= planning.date_debut:
                raise ValidationError('La date de fin doit être postérieure à la date de début')
            planning.date_fin = date_fin
        
        if 'statut' in data:
            validate_choice(data['statut'], 'Statut', ['actif', 'termine', 'archive', 'brouillon'])
            planning.statut = data['statut']
        
        if 'heures_etude_par_jour' in data:
            validate_float(data['heures_etude_par_jour'], 'Heures étude par jour', min_value=0.5, max_value=16.0)
            planning.heures_etude_par_jour = data['heures_etude_par_jour']
        
        if 'jours_etude_par_semaine' in data:
            validate_integer(data['jours_etude_par_semaine'], 'Jours étude par semaine', min_value=1, max_value=7)
            planning.jours_etude_par_semaine = data['jours_etude_par_semaine']
        
        if 'jours_repos' in data:
            if isinstance(data['jours_repos'], list):
                planning.set_jours_repos_list(data['jours_repos'])
            else:
                planning.jours_repos = data['jours_repos']
        
        planning.nombre_modifications += 1
        db.session.commit()
        
        return success_response(
            data=planning.to_dict(),
            message='Planning mis à jour avec succès'
        )
        
    except ValidationError as e:
        return error_response('Erreur de validation', str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required_custom
def delete_planning(id, current_user):
    """Supprime un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        db.session.delete(planning)
        db.session.commit()
        
        return success_response(message='Planning supprimé avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/archive', methods=['POST'])
@jwt_required_custom
def archive_planning(id, current_user):
    """Archive un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        planning.archiver()
        
        return success_response(
            data=planning.to_dict(),
            message='Planning archivé avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/activer', methods=['POST'])
@jwt_required_custom
def activer_planning(id, current_user):
    """Active un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        planning.activer()
        
        return success_response(
            data=planning.to_dict(),
            message='Planning activé avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/sessions', methods=['GET'])
@jwt_required_custom
def get_planning_sessions(id, current_user):
    """Récupère toutes les sessions d'un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        # Filtres
        completee = request.args.get('completee')
        date_filter = request.args.get('date')
        
        query = planning.sessions
        
        if completee is not None:
            completee_bool = completee.lower() in ['true', '1', 'yes']
            query = query.filter_by(completee=completee_bool)
        
        if date_filter:
            try:
                date_obj = datetime.fromisoformat(date_filter.replace('Z', '+00:00')).date()
                query = query.filter(db.func.date(Session.heure_debut) == date_obj)
            except:
                pass
        
        sessions = query.order_by(Session.heure_debut.asc()).all()
        
        return success_response(
            data=[session.to_dict(include_matiere=True) for session in sessions]
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/sessions/aujourdhui', methods=['GET'])
@jwt_required_custom
def get_sessions_aujourdhui(id, current_user):
    """Récupère les sessions d'aujourd'hui pour un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        sessions = planning.get_sessions_aujourdhui()
        
        return success_response(
            data=[session.to_dict(include_matiere=True) for session in sessions],
            message=f"{len(sessions)} session(s) aujourd'hui"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/sessions/semaine', methods=['GET'])
@jwt_required_custom

def get_sessions_semaine(id, current_user):
    """Récupère les sessions de cette semaine pour un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        sessions = planning.get_sessions_semaine()
        
        return success_response(
            data=[session.to_dict(include_matiere=True) for session in sessions],
            message=f"{len(sessions)} session(s) cette semaine"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/statistiques', methods=['GET'])
@jwt_required_custom

def get_planning_statistiques(id, current_user):
    """Récupère les statistiques d'un planning"""
    try:
        planning = Planning.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {id}', 404)
        
        return success_response(data=planning.generer_statistiques())
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/actifs', methods=['GET'])
@jwt_required_custom

def get_plannings_actifs(current_user):
    """Récupère les plannings actifs de l'utilisateur"""
    try:
        plannings = Planning.query.filter_by(
            user_id=current_user.id,
            statut='actif'
        ).order_by(Planning.date_debut.desc()).all()
        
        return success_response(
            data=[planning.to_dict(include_statistiques=True) for planning in plannings],
            message=f"{len(plannings)} planning(s) actif(s)"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)