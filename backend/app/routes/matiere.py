from flask import Blueprint, request, jsonify
from app import db
from app.models.matiere import Matiere
from app.utils.decorators import jwt_required_custom, validate_json, handle_validation_error, paginate
from app.utils.validators import (
    validate_string, validate_integer, validate_float, 
    validate_datetime, validate_hex_color, validate_choice, ValidationError
)
from app.utils.helpers import success_response, error_response

bp = Blueprint('matiere', __name__)


@bp.route('', methods=['GET'])
@jwt_required_custom
@paginate(default_per_page=50)
def get_matieres(current_user, page, per_page, offset):
    """
    Récupère toutes les matières de l'utilisateur
    Query params: active, archivee, semestre, urgent
    """
    try:
        query = Matiere.query.filter_by(user_id=current_user.id)
        
        # Filtres
        active = request.args.get('active')
        if active is not None:
            active_bool = active.lower() in ['true', '1', 'yes']
            query = query.filter_by(active=active_bool)
        
        archivee = request.args.get('archivee')
        if archivee is not None:
            archivee_bool = archivee.lower() in ['true', '1', 'yes']
            query = query.filter_by(archivee=archivee_bool)
        
        semestre = request.args.get('semestre')
        if semestre:
            query = query.filter_by(semestre=semestre)
        
        # Filtre urgent (examens proches)
        urgent = request.args.get('urgent')
        if urgent and urgent.lower() in ['true', '1', 'yes']:
            query = query.filter(Matiere.date_examen.isnot(None))
        
        # Tri
        sort_by = request.args.get('sort_by', 'date_creation')
        sort_order = request.args.get('sort_order', 'desc')
        
        if hasattr(Matiere, sort_by):
            sort_column = getattr(Matiere, sort_by)
            if sort_order == 'desc':
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
        
        # Pagination
        total = query.count()
        matieres = query.limit(per_page).offset(offset).all()
        
        return success_response({
            'matieres': [matiere.to_dict() for matiere in matieres],
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['GET'])
@jwt_required_custom
def get_matiere(id, current_user):
    """Récupère une matière par son ID"""
    try:
        matiere = Matiere.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not matiere:
            return error_response('Matière introuvable', f'Aucune matière avec l\'ID {id}', 404)
        
        # Inclure les tâches et sessions si demandé
        include_taches = request.args.get('include_taches', 'false').lower() == 'true'
        include_sessions = request.args.get('include_sessions', 'false').lower() == 'true'
        
        return success_response(
            data=matiere.to_dict(include_taches=include_taches, include_sessions=include_sessions)
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('', methods=['POST'])
@jwt_required_custom
@validate_json(
    required_fields=['nom'],
    optional_fields=['code', 'description', 'couleur', 'credits', 'coefficient', 
                    'semestre', 'date_examen', 'type_examen', 'priorite', 
                    'niveau_difficulte', 'temps_estime_total']
)
@handle_validation_error
def create_matiere(current_user, data):
    """Crée une nouvelle matière"""
    try:
        # Validation
        validate_string(data['nom'], 'Nom', min_length=2, max_length=100)
        
        # Créer la matière
        matiere = Matiere(
            nom=data['nom'].strip(),
            user_id=current_user.id
        )
        
        # Champs optionnels
        if 'code' in data and data['code']:
            validate_string(data['code'], 'Code', max_length=20)
            matiere.code = data['code'].strip()
        
        if 'description' in data:
            matiere.description = data['description']
        
        if 'couleur' in data:
            validate_hex_color(data['couleur'], 'Couleur')
            matiere.couleur = data['couleur']
        
        if 'credits' in data:
            validate_integer(data['credits'], 'Crédits', min_value=1, max_value=20)
            matiere.credits = data['credits']
        
        if 'coefficient' in data:
            validate_float(data['coefficient'], 'Coefficient', min_value=0.1, max_value=10.0)
            matiere.coefficient = data['coefficient']
        
        if 'semestre' in data and data['semestre']:
            validate_string(data['semestre'], 'Semestre', max_length=20)
            matiere.semestre = data['semestre']
        
        if 'date_examen' in data and data['date_examen']:
            matiere.date_examen = validate_datetime(data['date_examen'], 'Date examen')
        
        if 'type_examen' in data and data['type_examen']:
            validate_string(data['type_examen'], 'Type examen', max_length=50)
            matiere.type_examen = data['type_examen']
        
        if 'priorite' in data:
            validate_integer(data['priorite'], 'Priorité', min_value=1, max_value=10)
            matiere.priorite = data['priorite']
        
        if 'niveau_difficulte' in data:
            validate_integer(data['niveau_difficulte'], 'Niveau difficulté', min_value=1, max_value=10)
            matiere.niveau_difficulte = data['niveau_difficulte']
        
        if 'temps_estime_total' in data:
            validate_integer(data['temps_estime_total'], 'Temps estimé total', min_value=0)
            matiere.temps_estime_total = data['temps_estime_total']
        
        db.session.add(matiere)
        db.session.commit()
        
        return success_response(
            data=matiere.to_dict(),
            message='Matière créée avec succès',
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
    optional_fields=['nom', 'code', 'description', 'couleur', 'credits', 'coefficient',
                    'semestre', 'date_examen', 'type_examen', 'priorite',
                    'niveau_difficulte', 'temps_estime_total', 'active', 'archivee']
)
@handle_validation_error
def update_matiere(id, current_user, data):
    """Met à jour une matière"""
    try:
        matiere = Matiere.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not matiere:
            return error_response('Matière introuvable', f'Aucune matière avec l\'ID {id}', 404)
        
        # Mise à jour des champs
        if 'nom' in data:
            validate_string(data['nom'], 'Nom', min_length=2, max_length=100)
            matiere.nom = data['nom'].strip()
        
        if 'code' in data:
            if data['code']:
                validate_string(data['code'], 'Code', max_length=20)
                matiere.code = data['code'].strip()
            else:
                matiere.code = None
        
        if 'description' in data:
            matiere.description = data['description']
        
        if 'couleur' in data:
            validate_hex_color(data['couleur'], 'Couleur')
            matiere.couleur = data['couleur']
        
        if 'credits' in data:
            validate_integer(data['credits'], 'Crédits', min_value=1, max_value=20)
            matiere.credits = data['credits']
        
        if 'coefficient' in data:
            validate_float(data['coefficient'], 'Coefficient', min_value=0.1, max_value=10.0)
            matiere.coefficient = data['coefficient']
        
        if 'semestre' in data:
            matiere.semestre = data['semestre']
        
        if 'date_examen' in data:
            if data['date_examen']:
                matiere.date_examen = validate_datetime(data['date_examen'], 'Date examen')
            else:
                matiere.date_examen = None
        
        if 'type_examen' in data:
            matiere.type_examen = data['type_examen']
        
        if 'priorite' in data:
            validate_integer(data['priorite'], 'Priorité', min_value=1, max_value=10)
            matiere.priorite = data['priorite']
        
        if 'niveau_difficulte' in data:
            validate_integer(data['niveau_difficulte'], 'Niveau difficulté', min_value=1, max_value=10)
            matiere.niveau_difficulte = data['niveau_difficulte']
        
        if 'temps_estime_total' in data:
            if data['temps_estime_total']:
                validate_integer(data['temps_estime_total'], 'Temps estimé total', min_value=0)
                matiere.temps_estime_total = data['temps_estime_total']
            else:
                matiere.temps_estime_total = None
        
        if 'active' in data:
            matiere.active = bool(data['active'])
        
        if 'archivee' in data:
            matiere.archivee = bool(data['archivee'])
        
        db.session.commit()
        
        return success_response(
            data=matiere.to_dict(),
            message='Matière mise à jour avec succès'
        )
        
    except ValidationError as e:
        return error_response('Erreur de validation', str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required_custom
def delete_matiere(id, current_user):
    """Supprime une matière"""
    try:
        matiere = Matiere.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not matiere:
            return error_response('Matière introuvable', f'Aucune matière avec l\'ID {id}', 404)
        
        db.session.delete(matiere)
        db.session.commit()
        
        return success_response(message='Matière supprimée avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/archive', methods=['POST'])
@jwt_required_custom
def archive_matiere(id, current_user):
    """Archive une matière"""
    try:
        matiere = Matiere.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not matiere:
            return error_response('Matière introuvable', f'Aucune matière avec l\'ID {id}', 404)
        
        matiere.archivee = True
        matiere.active = False
        db.session.commit()
        
        return success_response(
            data=matiere.to_dict(),
            message='Matière archivée avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/unarchive', methods=['POST'])
@jwt_required_custom
def unarchive_matiere(id, current_user):
    """Désarchive une matière"""
    try:
        matiere = Matiere.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not matiere:
            return error_response('Matière introuvable', f'Aucune matière avec l\'ID {id}', 404)
        
        matiere.archivee = False
        matiere.active = True
        db.session.commit()
        
        return success_response(
            data=matiere.to_dict(),
            message='Matière désarchivée avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/progression', methods=['GET'])
@jwt_required_custom
def get_progression(id, current_user):
    """Récupère la progression d'une matière"""
    try:
        matiere = Matiere.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not matiere:
            return error_response('Matière introuvable', f'Aucune matière avec l\'ID {id}', 404)
        
        progression = {
            'pourcentage_complete': matiere.pourcentage_complete,
            'temps_estime_total': matiere.temps_estime_total,
            'temps_etudie': matiere.temps_etudie,
            'temps_restant': matiere.temps_restant_estime(),
            'taches_total': matiere.taches.count(),
            'taches_completees': matiere.taches.filter_by(etat='completee').count(),
            'sessions_total': matiere.sessions.count(),
            'sessions_completees': matiere.sessions.filter_by(completee=True).count()
        }
        
        return success_response(data=progression)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/urgentes', methods=['GET'])
@jwt_required_custom
def get_matieres_urgentes(current_user):
    """Récupère les matières avec examens urgents"""
    try:
        from datetime import datetime, timedelta
        
        seuil_jours = int(request.args.get('seuil_jours', 7))
        date_limite = datetime.utcnow() + timedelta(days=seuil_jours)
        
        matieres = Matiere.query.filter(
            Matiere.user_id == current_user.id,
            Matiere.active == True,
            Matiere.date_examen.isnot(None),
            Matiere.date_examen <= date_limite,
            Matiere.date_examen >= datetime.utcnow()
        ).order_by(Matiere.date_examen.asc()).all()
        
        return success_response(
            data=[matiere.to_dict() for matiere in matieres],
            message=f"{len(matieres)} matière(s) avec examen dans les {seuil_jours} prochains jours"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/statistics', methods=['GET'])
@jwt_required_custom
def get_statistics(current_user):
    """Récupère les statistiques globales des matières"""
    try:
        matieres = Matiere.query.filter_by(user_id=current_user.id, active=True).all()
        
        stats = {
            'total_matieres': len(matieres),
            'matieres_archivees': Matiere.query.filter_by(user_id=current_user.id, archivee=True).count(),
            'temps_total_etudie': sum(m.temps_etudie or 0 for m in matieres),
            'temps_total_estime': sum(m.temps_estime_total or 0 for m in matieres),
            'progression_moyenne': round(sum(m.pourcentage_complete for m in matieres) / len(matieres), 2) if matieres else 0,
            'examens_a_venir': len([m for m in matieres if m.date_examen and m.date_examen >= datetime.utcnow()]),
            'matieres_urgentes': len([m for m in matieres if m.est_urgent()])
        }
        
        return success_response(data=stats)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/couleurs', methods=['GET'])
def get_couleurs_disponibles():
    """Récupère les couleurs disponibles pour les matières"""
    return success_response(data=Matiere.get_couleurs_disponibles())