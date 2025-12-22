"""
Routes pour les services IA (Planning Generator, PDF Analyzer, Notifications)
VERSION MODIFIÉE: Support format frontend pour génération planning
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
    
    **NOUVEAU: Support de deux formats d'entrée**
    
    Format 1 (Frontend React):
    {
        "subject_ids": [1, 2, 3],
        "preferences": {
            "sessionDuration": 120,
            "studyDaysPerWeek": 5,
            "preferredStartTime": "09:00",
            "preferredEndTime": "18:00",
            "includeWeekends": false
        }
    }
    
    Format 2 (Original):
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
        
        if not data:
            return error_response(
                'Données manquantes',
                'Le corps de la requête ne peut pas être vide',
                400
            )
        
        # NOUVEAU: Détection automatique du format
        if 'subject_ids' in data:
            # ========================================
            # FORMAT FRONTEND (React)
            # ========================================
            print("📱 Format frontend détecté")
            
            # Calculer dates automatiquement
            # Par défaut: 2 semaines à partir d'aujourd'hui
            date_debut = datetime.now().date()
            date_fin = date_debut + timedelta(weeks=2)
            
            # Extraire préférences
            preferences = data.get('preferences', {})
            
            # Convertir sessionDuration (minutes) en heures par jour
            session_duration_minutes = preferences.get('sessionDuration', 120)
            # Si l'étudiant veut des sessions de 2h, on peut faire 2-3 sessions par jour = 4-6h
            heures_etude_par_jour = min(8.0, (session_duration_minutes / 60) * 3)
            
            # Jours d'étude par semaine
            jours_etude_par_semaine = preferences.get('studyDaysPerWeek', 5)
            
            # Gestion des weekends
            include_weekends = preferences.get('includeWeekends', False)
            if include_weekends:
                jours_repos = []  # Pas de repos
            else:
                jours_repos = ['samedi', 'dimanche']
            
            print(f"✓ Dates calculées: {date_debut} -> {date_fin}")
            print(f"✓ Heures/jour: {heures_etude_par_jour}h")
            print(f"✓ Jours/semaine: {jours_etude_par_semaine}")
            print(f"✓ Jours repos: {jours_repos}")
            
        else:
            # ========================================
            # FORMAT ORIGINAL (Backend)
            # ========================================
            print("🖥️  Format backend original détecté")
            
            # Validation des champs requis
            if 'date_debut' not in data or 'date_fin' not in data:
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
        
        # ========================================
        # GÉNÉRATION DU PLANNING (Commun)
        # ========================================
        print(f"\n🎯 Génération planning pour {current_user.nom}...")
        
        # Créer le générateur
        generator = PlanningGenerator(current_user)
        
        # Générer le planning
        planning = generator.generer_planning_automatique(
            date_debut=date_debut,
            date_fin=date_fin,
            heures_etude_par_jour=heures_etude_par_jour,
            jours_etude_par_semaine=jours_etude_par_semaine,
            jours_repos=jours_repos
        )
        
        print(f"✅ Planning généré: {planning.nom}")
        print(f"   - {planning.sessions_total} sessions")
        print(f"   - Score qualité: {planning.score_qualite}/100")
        
        # Retourner le planning avec sessions et stats
        return success_response(
            data=planning.to_dict(include_sessions=True, include_statistiques=True),
            message='Planning généré avec succès',
            status_code=201
        )
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erreur génération planning: {e}")
        import traceback
        traceback.print_exc()
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
        if planning.user_id != current_user.id:
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
        if emploi.user_id != current_user.id:
            return error_response('Accès refusé', 'Cet emploi du temps ne vous appartient pas', 403)
        
        print(f"\n📄 Analyse PDF pour emploi {emploi_id}...")
        
        # Analyser
        analyzer = PDFAnalyzer(emploi)
        resultat = analyzer.analyser()
        
        if resultat['success']:
            print(f"✅ Analyse réussie: {resultat['cours_extraits']} cours extraits")
            
            return success_response(
                data={
                    'emploi_du_temps': emploi.to_dict(include_cours=True),
                    'analyse': resultat
                },
                message=resultat['message']
            )
        else:
            print(f"❌ Analyse échouée: {resultat.get('error')}")
            return error_response('Erreur analyse', resultat['message'], 500)
        
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        import traceback
        traceback.print_exc()
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
        
        if emploi.user_id != current_user.id:
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