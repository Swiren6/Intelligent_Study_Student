"""
Routes pour les statistiques
Fournit les endpoints pour afficher les stats d'étude de l'utilisateur
"""

from flask import Blueprint, request
from app import db
from app.models.user import User
from app.models.matiere import Matiere
from app.models.session import Session
from app.models.tache import Tache
from app.utils.decorators import jwt_required_custom
from app.utils.helpers import success_response, error_response
from datetime import datetime, timedelta

bp = Blueprint('stats', __name__)


@bp.route('/user', methods=['GET'])
@jwt_required_custom
def get_user_stats(current_user):
    """
    Récupère les statistiques globales de l'utilisateur
    """
    try:
        # Calculer temps total d'étude
        total_minutes = 0
        for matiere in current_user.matieres.filter_by(active=True):
            total_minutes += matiere.temps_etudie or 0
        
        total_hours = round(total_minutes / 60, 1)
        
        # Compter sessions
        all_sessions = Session.query.join(Session.planning).filter(
            Planning.user_id == current_user.id
        ).all()
        
        total_sessions = len(all_sessions)
        completed_sessions = len([s for s in all_sessions if s.completee])
        
        # Matières actives
        subjects_studied = current_user.matieres.filter_by(active=True).count()
        
        # Taux de complétion
        completion_rate = 0
        if total_sessions > 0:
            completion_rate = int((completed_sessions / total_sessions) * 100)
        
        # Données pour graphiques
        # 1. Heures par matière
        hours_by_subject = []
        for matiere in current_user.matieres.filter_by(active=True).limit(5):
            hours_by_subject.append({
                'name': matiere.nom,
                'hours': round((matiere.temps_etudie or 0) / 60, 1)
            })
        
        # 2. Progression hebdomadaire (4 dernières semaines)
        weekly_progress = []
        for i in range(4):
            week_start = datetime.utcnow() - timedelta(weeks=i+1)
            week_end = datetime.utcnow() - timedelta(weeks=i)
            
            week_sessions = [s for s in all_sessions 
                           if s.completee and week_start <= s.heure_debut <= week_end]
            
            week_hours = sum((s.duree_reelle or 0) / 60 for s in week_sessions)
            
            weekly_progress.insert(0, {
                'week': f'Sem {4-i}',
                'hours': round(week_hours, 1)
            })
        
        # 3. Répartition du temps (simulé pour l'instant)
        time_distribution = [
            {'name': 'Matin (8h-12h)', 'value': 35},
            {'name': 'Après-midi (14h-18h)', 'value': 45},
            {'name': 'Soir (18h-22h)', 'value': 20}
        ]
        
        stats = {
            'summary': {
                'total_hours': total_hours,
                'total_sessions': total_sessions,
                'subjects_studied': subjects_studied,
                'completion_rate': completion_rate
            },
            'hours_by_subject': hours_by_subject,
            'weekly_progress': weekly_progress,
            'time_distribution': time_distribution
        }
        
        return success_response(data=stats)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/subject/<int:subject_id>', methods=['GET'])
@jwt_required_custom
def get_subject_stats(subject_id, current_user):
    """
    Récupère les statistiques d'une matière spécifique
    """
    try:
        matiere = Matiere.query.filter_by(
            id=subject_id,
            user_id=current_user.id
        ).first()
        
        if not matiere:
            return error_response('Matière introuvable', 'Aucune matière avec cet ID', 404)
        
        # Sessions de cette matière
        sessions = matiere.sessions.filter_by(completee=True).all()
        
        # Temps total
        total_minutes = matiere.temps_etudie or 0
        total_hours = round(total_minutes / 60, 1)
        
        # Tâches
        taches_total = matiere.taches.count()
        taches_completees = matiere.taches.filter_by(etat='completee').count()
        
        stats = {
            'matiere_id': matiere.id,
            'matiere_nom': matiere.nom,
            'temps_etudie': total_hours,
            'sessions_completees': len(sessions),
            'taches_total': taches_total,
            'taches_completees': taches_completees,
            'progression': matiere.pourcentage_complete or 0,
            'priorite': matiere.priorite,
            'niveau_difficulte': matiere.niveau_difficulte,
            'jours_avant_examen': matiere.jours_avant_examen()
        }
        
        return success_response(data=stats)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/weekly', methods=['GET'])
@jwt_required_custom
def get_weekly_stats(current_user):
    """
    Récupère les statistiques de cette semaine
    """
    try:
        week_start = datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())
        
        # Sessions de la semaine
        from app.models.planning import Planning
        sessions_week = Session.query.join(Session.planning).filter(
            Planning.user_id == current_user.id,
            Session.heure_debut >= week_start
        ).all()
        
        completed = [s for s in sessions_week if s.completee]
        
        stats = {
            'semaine': f"Semaine du {week_start.strftime('%d/%m')}",
            'sessions_planifiees': len(sessions_week),
            'sessions_completees': len(completed),
            'heures_etudiees': sum((s.duree_reelle or 0) / 60 for s in completed),
            'taux_completion': int((len(completed) / len(sessions_week) * 100)) if sessions_week else 0
        }
        
        return success_response(data=stats)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)