from flask import Blueprint, request, jsonify
from app import db
from app.models.notification import Notification
from app.utils.decorators import jwt_required_custom, validate_json, handle_validation_error
from app.utils.validators import ValidationError
from app.utils.helpers import success_response, error_response

bp = Blueprint('notification', __name__)


@bp.route('', methods=['GET'])
@jwt_required_custom
def get_notifications(current_user):
    """
    Récupère toutes les notifications de l'utilisateur
    Query params: lue, envoyee, archivee, priorite, type_notification
    """
    try:
        query = Notification.query.filter_by(user_id=current_user.id)
        
        # Filtres
        lue = request.args.get('lue')
        if lue is not None:
            lue_bool = lue.lower() in ['true', '1', 'yes']
            query = query.filter_by(lue=lue_bool)
        
        envoyee = request.args.get('envoyee')
        if envoyee is not None:
            envoyee_bool = envoyee.lower() in ['true', '1', 'yes']
            query = query.filter_by(envoyee=envoyee_bool)
        
        archivee = request.args.get('archivee')
        if archivee is not None:
            archivee_bool = archivee.lower() in ['true', '1', 'yes']
            query = query.filter_by(archivee=archivee_bool)
        
        priorite = request.args.get('priorite')
        if priorite:
            query = query.filter_by(priorite=priorite)
        
        type_notification = request.args.get('type_notification')
        if type_notification:
            query = query.filter_by(type_notification=type_notification)
        
        # Tri par date d'envoi (plus récent d'abord)
        notifications = query.order_by(Notification.date_envoi.desc()).limit(100).all()
        
        include_relations = request.args.get('include_relations', 'false').lower() == 'true'
        
        return success_response(
            data=[notif.to_dict(include_relations=include_relations) for notif in notifications],
            message=f"{len(notifications)} notification(s) trouvée(s)"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['GET'])
@jwt_required_custom
def get_notification(id, current_user):
    """Récupère une notification par son ID"""
    try:
        notification = Notification.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not notification:
            return error_response('Notification introuvable', f'Aucune notification avec l\'ID {id}', 404)
        
        return success_response(data=notification.to_dict(include_relations=True))
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/marquer-lue', methods=['POST'])
@jwt_required_custom
def marquer_lue(id, current_user):
    """Marque une notification comme lue"""
    try:
        notification = Notification.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not notification:
            return error_response('Notification introuvable', f'Aucune notification avec l\'ID {id}', 404)
        
        notification.marquer_lue()
        
        return success_response(
            data=notification.to_dict(),
            message='Notification marquée comme lue'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/marquer-toutes-lues', methods=['POST'])
@jwt_required_custom
def marquer_toutes_lues(current_user):
    """Marque toutes les notifications comme lues"""
    try:
        notifications = Notification.query.filter_by(
            user_id=current_user.id,
            lue=False
        ).all()
        
        count = 0
        for notif in notifications:
            notif.marquer_lue()
            count += 1
        
        return success_response(message=f'{count} notification(s) marquée(s) comme lue(s)')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>/archiver', methods=['POST'])
@jwt_required_custom
def archiver_notification(id, current_user):
    """Archive une notification"""
    try:
        notification = Notification.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not notification:
            return error_response('Notification introuvable', f'Aucune notification avec l\'ID {id}', 404)
        
        notification.archiver()
        
        return success_response(
            data=notification.to_dict(),
            message='Notification archivée'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required_custom
def delete_notification(id, current_user):
    """Supprime une notification"""
    try:
        notification = Notification.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not notification:
            return error_response('Notification introuvable', f'Aucune notification avec l\'ID {id}', 404)
        
        db.session.delete(notification)
        db.session.commit()
        
        return success_response(message='Notification supprimée avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/non-lues', methods=['GET'])
@jwt_required_custom
def get_notifications_non_lues(current_user):
    """Récupère les notifications non lues"""
    try:
        notifications = Notification.query.filter_by(
            user_id=current_user.id,
            lue=False,
            archivee=False
        ).order_by(Notification.date_envoi.desc()).all()
        
        return success_response(
            data=[notif.to_dict(include_relations=True) for notif in notifications],
            message=f"{len(notifications)} notification(s) non lue(s)"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/urgentes', methods=['GET'])
@jwt_required_custom
def get_notifications_urgentes(current_user):
    """Récupère les notifications urgentes"""
    try:
        notifications = Notification.query.filter_by(
            user_id=current_user.id,
            priorite='urgente',
            lue=False,
            archivee=False
        ).order_by(Notification.date_envoi.desc()).all()
        
        return success_response(
            data=[notif.to_dict(include_relations=True) for notif in notifications],
            message=f"{len(notifications)} notification(s) urgente(s)"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/statistiques', methods=['GET'])
@jwt_required_custom
def get_statistiques(current_user):
    """Récupère les statistiques des notifications"""
    try:
        total = Notification.query.filter_by(user_id=current_user.id).count()
        non_lues = Notification.query.filter_by(user_id=current_user.id, lue=False).count()
        urgentes = Notification.query.filter_by(user_id=current_user.id, priorite='urgente', lue=False).count()
        archivees = Notification.query.filter_by(user_id=current_user.id, archivee=True).count()
        
        par_type = {}
        types = db.session.query(Notification.type_notification, db.func.count(Notification.id)).filter_by(
            user_id=current_user.id
        ).group_by(Notification.type_notification).all()
        
        for type_notif, count in types:
            par_type[type_notif] = count
        
        stats = {
            'total': total,
            'non_lues': non_lues,
            'urgentes': urgentes,
            'archivees': archivees,
            'par_type': par_type
        }
        
        return success_response(data=stats)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/nettoyer-archivees', methods=['DELETE'])
@jwt_required_custom
def nettoyer_archivees(current_user):
    """Supprime toutes les notifications archivées"""
    try:
        notifications = Notification.query.filter_by(
            user_id=current_user.id,
            archivee=True
        ).all()
        
        count = len(notifications)
        
        for notif in notifications:
            db.session.delete(notif)
        
        db.session.commit()
        
        return success_response(message=f'{count} notification(s) archivée(s) supprimée(s)')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/a-envoyer', methods=['GET'])
@jwt_required_custom
def get_notifications_a_envoyer(current_user):
    """
    Récupère les notifications qui doivent être envoyées
    (Utilisé par un service de tâches planifiées)
    """
    try:
        from datetime import datetime
        
        notifications = Notification.query.filter(
            Notification.user_id == current_user.id,
            Notification.envoyee == False,
            Notification.archivee == False,
            Notification.date_envoi <= datetime.utcnow()
        ).all()
        
        return success_response(
            data=[notif.to_dict(include_relations=True) for notif in notifications],
            message=f"{len(notifications)} notification(s) à envoyer"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)