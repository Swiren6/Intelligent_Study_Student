"""
Service de gestion des notifications et rappels automatiques
Utilise APScheduler pour planifier l'envoi des notifications
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app import db
from app.models.user import User
from app.models.notification import Notification
from app.models.session import Session
from app.models.tache import Tache
from app.models.matiere import Matiere


class NotificationService:
    """
    Service pour créer et gérer les notifications automatiques
    """
    
    @staticmethod
    def creer_notifications_sessions_quotidiennes() -> Dict:
        """
        Crée les notifications pour toutes les sessions du jour
        À exécuter chaque jour via un cron job
        
        Returns:
            Résumé de l'opération
        """
        aujourd_hui = datetime.now().date()
        
        # Récupérer toutes les sessions d'aujourd'hui
        sessions = Session.query.filter_by(
            date=aujourd_hui,
            completee=False,
            annulee=False
        ).all()
        
        notifications_creees = 0
        
        for session in sessions:
            # Vérifier qu'une notification n'existe pas déjà
            notif_existante = Notification.query.filter_by(
                session_id=session.id,
                utilisateur_id=session.planning.utilisateur_id
            ).first()
            
            if not notif_existante:
                # Créer la notification
                notification = Notification.creer_notification_session(session)
                db.session.add(notification)
                notifications_creees += 1
        
        db.session.commit()
        
        return {
            'success': True,
            'sessions_traitees': len(sessions),
            'notifications_creees': notifications_creees,
            'message': f'{notifications_creees} notifications créées pour {len(sessions)} sessions'
        }
    
    @staticmethod
    def creer_notifications_taches_urgentes() -> Dict:
        """
        Crée des notifications pour les tâches qui arrivent à échéance
        À exécuter quotidiennement
        
        Returns:
            Résumé de l'opération
        """
        aujourd_hui = datetime.now().date()
        dans_3_jours = aujourd_hui + timedelta(days=3)
        
        # Récupérer les tâches urgentes (deadline dans les 3 jours)
        taches_urgentes = Tache.query.filter(
            Tache.date_limite.isnot(None),
            Tache.date_limite <= dans_3_jours,
            Tache.date_limite >= aujourd_hui,
            Tache.etat.in_(['a_faire', 'en_cours'])
        ).all()
        
        notifications_creees = 0
        
        for tache in taches_urgentes:
            # Vérifier qu'une notification récente n'existe pas
            notif_existante = Notification.query.filter_by(
                tache_id=tache.id,
                utilisateur_id=tache.utilisateur_id
            ).filter(
                Notification.date_creation >= aujourd_hui
            ).first()
            
            if not notif_existante:
                notification = Notification.creer_notification_tache(tache)
                db.session.add(notification)
                notifications_creees += 1
        
        db.session.commit()
        
        return {
            'success': True,
            'taches_urgentes': len(taches_urgentes),
            'notifications_creees': notifications_creees,
            'message': f'{notifications_creees} notifications créées pour {len(taches_urgentes)} tâches urgentes'
        }
    
    @staticmethod
    def creer_notifications_examens() -> Dict:
        """
        Crée des notifications pour les examens à venir
        À exécuter quotidiennement
        
        Returns:
            Résumé de l'opération
        """
        aujourd_hui = datetime.now().date()
        dans_7_jours = aujourd_hui + timedelta(days=7)
        
        # Récupérer les matières avec examen dans les 7 jours
        matieres_examen = Matiere.query.filter(
            Matiere.date_examen.isnot(None),
            Matiere.date_examen <= dans_7_jours,
            Matiere.date_examen >= aujourd_hui,
            Matiere.archivee == False
        ).all()
        
        notifications_creees = 0
        
        for matiere in matieres_examen:
            # Vérifier qu'une notification récente n'existe pas
            notif_existante = Notification.query.filter_by(
                matiere_id=matiere.id,
                utilisateur_id=matiere.utilisateur_id,
                type_notification='examen'
            ).filter(
                Notification.date_creation >= aujourd_hui
            ).first()
            
            if not notif_existante:
                notification = Notification.creer_notification_examen(matiere)
                db.session.add(notification)
                notifications_creees += 1
        
        db.session.commit()
        
        return {
            'success': True,
            'examens_proches': len(matieres_examen),
            'notifications_creees': notifications_creees,
            'message': f'{notifications_creees} notifications créées pour {len(matieres_examen)} examens'
        }
    
    @staticmethod
    def envoyer_notifications_en_attente() -> Dict:
        """
        Envoie toutes les notifications en attente
        À exécuter régulièrement (toutes les 15 minutes par exemple)
        
        Returns:
            Résumé de l'opération
        """
        # Récupérer les notifications à envoyer
        notifications = Notification.query.filter_by(
            envoyee=False,
            archivee=False
        ).filter(
            Notification.date_envoi <= datetime.now()
        ).all()
        
        notifications_envoyees = 0
        
        for notification in notifications:
            try:
                # Dans une vraie implémentation, on enverrait via:
                # - Email (SMTP)
                # - Push notification (Firebase, OneSignal, etc.)
                # - WebSocket pour notification en temps réel
                
                # Pour l'instant, on marque juste comme envoyée
                notification.marquer_envoyee()
                notifications_envoyees += 1
                
            except Exception as e:
                # Logger l'erreur mais continuer
                print(f"Erreur lors de l'envoi de la notification {notification.id}: {str(e)}")
                continue
        
        db.session.commit()
        
        return {
            'success': True,
            'notifications_envoyees': notifications_envoyees,
            'message': f'{notifications_envoyees} notifications envoyées'
        }
    
    @staticmethod
    def creer_notification_personnalisee(user_id: int, titre: str, message: str,
                                        priorite: str = 'normale',
                                        type_notification: str = 'systeme',
                                        action_url: str = None,
                                        action_label: str = None) -> Notification:
        """
        Crée une notification personnalisée
        
        Args:
            user_id: ID de l'utilisateur
            titre: Titre de la notification
            message: Message de la notification
            priorite: Priorité (basse/normale/haute/urgente)
            type_notification: Type (session/tache/examen/systeme)
            action_url: URL de l'action
            action_label: Label du bouton d'action
        
        Returns:
            Notification créée
        """
        notification = Notification(
            utilisateur_id=user_id,
            type_notification=type_notification,
            titre=titre,
            message=message,
            priorite=priorite,
            date_envoi=datetime.now(),
            action_url=action_url,
            action_label=action_label
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @staticmethod
    def creer_notification_bienvenue(user: User) -> Notification:
        """
        Crée une notification de bienvenue pour un nouvel utilisateur
        
        Args:
            user: Utilisateur nouvellement inscrit
        
        Returns:
            Notification créée
        """
        notification = Notification(
            utilisateur_id=user.id,
            type_notification='systeme',
            titre=f"Bienvenue {user.nom} ! 👋",
            message="Bienvenue sur votre assistant d'étude intelligent ! Commencez par ajouter vos matières et créer votre premier planning.",
            priorite='normale',
            date_envoi=datetime.now(),
            action_url='/matieres/ajouter',
            action_label='Ajouter une matière'
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @staticmethod
    def creer_notification_progression(matiere: Matiere) -> Optional[Notification]:
        """
        Crée une notification de félicitation pour progression
        
        Args:
            matiere: Matière dont la progression a augmenté
        
        Returns:
            Notification créée ou None
        """
        # Seuils de progression pour félicitations
        seuils = [25, 50, 75, 100]
        progression = matiere.pourcentage_complete or 0
        
        # Vérifier si on vient de franchir un seuil
        for seuil in seuils:
            if progression >= seuil:
                # Vérifier qu'on n'a pas déjà félicité pour ce seuil
                notif_existante = Notification.query.filter_by(
                    utilisateur_id=matiere.utilisateur_id,
                    matiere_id=matiere.id,
                    type_notification='systeme'
                ).filter(
                    Notification.message.like(f'%{seuil}%')
                ).first()
                
                if not notif_existante:
                    emoji = '🎯' if seuil < 100 else '🎉'
                    
                    notification = Notification(
                        utilisateur_id=matiere.utilisateur_id,
                        matiere_id=matiere.id,
                        type_notification='systeme',
                        titre=f"Bravo ! {emoji}",
                        message=f"Vous avez complété {seuil}% de {matiere.nom} ! Continuez comme ça !",
                        priorite='normale',
                        date_envoi=datetime.now()
                    )
                    
                    db.session.add(notification)
                    db.session.commit()
                    
                    return notification
        
        return None
    
    @staticmethod
    def nettoyer_anciennes_notifications(jours: int = 30) -> Dict:
        """
        Supprime les notifications anciennes et archivées
        
        Args:
            jours: Nombre de jours après lesquels supprimer
        
        Returns:
            Résumé de l'opération
        """
        date_limite = datetime.now() - timedelta(days=jours)
        
        # Supprimer les notifications archivées anciennes
        notifications_a_supprimer = Notification.query.filter(
            Notification.archivee == True,
            Notification.date_creation < date_limite
        ).all()
        
        count = len(notifications_a_supprimer)
        
        for notification in notifications_a_supprimer:
            db.session.delete(notification)
        
        db.session.commit()
        
        return {
            'success': True,
            'notifications_supprimees': count,
            'message': f'{count} anciennes notifications supprimées'
        }
    
    @staticmethod
    def obtenir_statistiques_utilisateur(user_id: int) -> Dict:
        """
        Obtient les statistiques de notifications pour un utilisateur
        
        Args:
            user_id: ID de l'utilisateur
        
        Returns:
            Statistiques
        """
        total = Notification.query.filter_by(utilisateur_id=user_id).count()
        non_lues = Notification.query.filter_by(utilisateur_id=user_id, lue=False).count()
        urgentes = Notification.query.filter_by(utilisateur_id=user_id, priorite='urgente', lue=False).count()
        
        # Par type
        stats_par_type = {}
        types = ['session', 'tache', 'examen', 'systeme']
        
        for type_notif in types:
            count = Notification.query.filter_by(
                utilisateur_id=user_id,
                type_notification=type_notif
            ).count()
            stats_par_type[type_notif] = count
        
        return {
            'total': total,
            'non_lues': non_lues,
            'urgentes': urgentes,
            'par_type': stats_par_type
        }
    
    @staticmethod
    def planifier_rappels_sessions(session: Session) -> List[Notification]:
        """
        Planifie les rappels pour une session
        
        Args:
            session: Session pour laquelle créer les rappels
        
        Returns:
            Liste de notifications créées
        """
        notifications = []
        
        # Rappel 30 minutes avant (si activé)
        if session.rappel_active:
            datetime_session = datetime.combine(session.date, session.heure_debut)
            date_rappel = datetime_session - timedelta(minutes=session.minutes_avant_rappel)
            
            # Ne créer que si la date de rappel est dans le futur
            if date_rappel > datetime.now():
                notification = Notification(
                    utilisateur_id=session.planning.utilisateur_id,
                    session_id=session.id,
                    type_notification='session',
                    titre=f"Rappel : {session.titre}",
                    message=f"Votre session d'étude commence dans {session.minutes_avant_rappel} minutes",
                    priorite='haute',
                    date_envoi=date_rappel,
                    action_url=f'/sessions/{session.id}',
                    action_label='Voir la session'
                )
                
                db.session.add(notification)
                notifications.append(notification)
        
        db.session.commit()
        
        return notifications