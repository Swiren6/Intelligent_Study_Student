"""
Routes pour les services IA (Planning Generator, PDF Analyzer, Notifications)
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.models.planning import Planning
from app.models.emploi_du_temps import EmploiDuTemps
from app.utils.decorators import jwt_required_custom, admin_required
from app.utils.validators import validate_date
from app.utils.helpers import success_response, error_response
from app.services.pdf_analyzer import PDFAnalyzer
from app.services.planning_generator import PlanningGenerator
from app.services.notification_service import NotificationService
from datetime import datetime, timedelta

bp = Blueprint('services', __name__)


# ============================================================================
# ROUTES GÉNÉRATION DE PLANNING
# ============================================================================

@bp.route('/generer-planning', methods=['POST'])
@jwt_required_custom
def generer_planning(current_user):
    """
    Génère automatiquement un planning d'étude optimisé
    
    Body JSON:
    {
        "date_debut": "2024-01-15",
        "date_fin": "2024-03-15",
        "heures_etude_par_jour": 4.0,
        "jours_etude_par_semaine": 6,
        "jours_repos": ["dimanche"]
    }
    """
    try:
        data = request.get_json()
        
        # Validation
        if not data or 'date_debut' not in data or 'date_fin' not in data:
            return error_response(
                'Champs manquants',
                'date_debut et date_fin sont requis',
                400
            )
        
        date_debut = validate_date(data['date_debut'], 'Date début')
        date_fin = validate_date(data['date_fin'], 'Date fin')
        
        if date_fin <= date_debut:
            return error_response(
                'Dates invalides',
                'La date de fin doit être après la date de début',
                400
            )
        
        heures_etude_par_jour = data.get('heures_etude_par_jour', 4.0)
        jours_etude_par_semaine = data.get('jours_etude_par_semaine', 6)
        jours_repos = data.get('jours_repos', ['dimanche'])
        
        # Générer le planning
        generator = PlanningGenerator(current_user)
        planning = generator.generer_planning_automatique(
            date_debut=date_debut,
            date_fin=date_fin,
            heures_etude_par_jour=heures_etude_par_jour,
            jours_etude_par_semaine=jours_etude_par_semaine,
            jours_repos=jours_repos
        )
        
        return success_response(
            data=planning.to_dict(),
            message='Planning généré avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/optimiser-planning/<int:planning_id>', methods=['POST'])
@jwt_required_custom
def optimiser_planning(planning_id, current_user):
    """
    Optimise un planning existant
    """
    try:
        planning = Planning.query.get(planning_id)
        
        if not planning:
            return error_response('Planning introuvable', f'Aucun planning avec l\'ID {planning_id}', 404)
        
        # Vérifier ownership
        if planning.utilisateur_id != current_user.id:
            return error_response('Accès refusé', 'Ce planning ne vous appartient pas', 403)
        
        # Optimiser
        resultat = PlanningGenerator.optimiser_planning_existant(planning)
        
        return success_response(
            data=resultat,
            message='Planning optimisé'
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


# ============================================================================
# ROUTES ANALYSE PDF
# ============================================================================

@bp.route('/analyser-pdf/<int:emploi_id>', methods=['POST'])
@jwt_required_custom
def analyser_pdf(emploi_id, current_user):
    """
    Lance l'analyse d'un emploi du temps PDF
    """
    try:
        emploi = EmploiDuTemps.query.get(emploi_id)
        
        if not emploi:
            return error_response('Emploi du temps introuvable', f'Aucun emploi avec l\'ID {emploi_id}', 404)
        
        # Vérifier ownership
        if emploi.utilisateur_id != current_user.id:
            return error_response('Accès refusé', 'Cet emploi du temps ne vous appartient pas', 403)
        
        # Analyser
        analyzer = PDFAnalyzer(emploi)
        resultat = analyzer.analyser()
        
        if resultat['success']:
            return success_response(
                data={
                    'emploi_du_temps': emploi.to_dict(include_cours=True),
                    'analyse': resultat
                },
                message=resultat['message']
            )
        else:
            return error_response('Erreur analyse', resultat['message'], 500)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/creneaux-libres/<int:emploi_id>', methods=['GET'])
@jwt_required_custom
def creneaux_libres(emploi_id, current_user):
    """
    Récupère les créneaux libres d'un emploi du temps
    """
    try:
        emploi = EmploiDuTemps.query.get(emploi_id)
        
        if not emploi:
            return error_response('Emploi du temps introuvable', f'Aucun emploi avec l\'ID {emploi_id}', 404)
        
        if emploi.utilisateur_id != current_user.id:
            return error_response('Accès refusé', 'Cet emploi du temps ne vous appartient pas', 403)
        
        creneaux = PDFAnalyzer.detecter_creneaux_libres(emploi)
        
        return success_response(
            data=creneaux,
            message=f'{len(creneaux)} créneaux libres trouvés'
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


# ============================================================================
# ROUTES NOTIFICATIONS
# ============================================================================

@bp.route('/creer-notification', methods=['POST'])
@jwt_required_custom
def creer_notification_personnalisee(current_user):
    """
    Crée une notification personnalisée
    
    Body JSON:
    {
        "titre": "Titre",
        "message": "Message",
        "priorite": "normale",
        "type_notification": "systeme"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'titre' not in data or 'message' not in data:
            return error_response('Champs manquants', 'Titre et message requis', 400)
        
        notification = NotificationService.creer_notification_personnalisee(
            user_id=current_user.id,
            titre=data['titre'],
            message=data['message'],
            priorite=data.get('priorite', 'normale'),
            type_notification=data.get('type_notification', 'systeme'),
            action_url=data.get('action_url'),
            action_label=data.get('action_label')
        )
        
        return success_response(
            data=notification.to_dict(),
            message='Notification créée'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/statistiques-notifications', methods=['GET'])
@jwt_required_custom
def statistiques_notifications(current_user):
    """
    Récupère les statistiques de notifications
    """
    try:
        stats = NotificationService.obtenir_statistiques_utilisateur(current_user.id)
        
        return success_response(data=stats)
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


# ============================================================================
# ROUTES ADMIN - TÂCHES AUTOMATIQUES
# ============================================================================

@bp.route('/admin/executer-notifications-quotidiennes', methods=['POST'])
@admin_required
def executer_notifications_quotidiennes(current_user):
    """
    Lance manuellement la création des notifications quotidiennes
    (En production, ceci serait exécuté par un cron job)
    """
    try:
        # Sessions
        resultat_sessions = NotificationService.creer_notifications_sessions_quotidiennes()
        
        # Tâches urgentes
        resultat_taches = NotificationService.creer_notifications_taches_urgentes()
        
        # Examens
        resultat_examens = NotificationService.creer_notifications_examens()
        
        return success_response(
            data={
                'sessions': resultat_sessions,
                'taches': resultat_taches,
                'examens': resultat_examens
            },
            message='Notifications quotidiennes créées'
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/admin/envoyer-notifications', methods=['POST'])
@admin_required
def envoyer_notifications(current_user):
    """
    Envoie toutes les notifications en attente
    (En production, exécuté par un cron job toutes les 15 minutes)
    """
    try:
        resultat = NotificationService.envoyer_notifications_en_attente()
        
        return success_response(
            data=resultat,
            message=resultat['message']
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/admin/nettoyer-notifications', methods=['POST'])
@admin_required
def nettoyer_notifications(current_user):
    """
    Nettoie les anciennes notifications archivées
    """
    try:
        jours = request.args.get('jours', 30, type=int)
        resultat = NotificationService.nettoyer_anciennes_notifications(jours)
        
        return success_response(
            data=resultat,
            message=resultat['message']
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)