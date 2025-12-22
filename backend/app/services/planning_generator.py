"""
Service de génération automatique de plannings d'étude
Utilise des algorithmes d'optimisation pour créer des plannings intelligents
"""

from datetime import datetime, date, time, timedelta
from typing import List, Dict, Optional
from app import db
from app.models.user import User
from app.models.matiere import Matiere
from app.models.tache import Tache
from app.models.planning import Planning
from app.models.session import Session
from app.models.emploi_du_temps import EmploiDuTemps
from app.models.cours import Cours

import random


class PlanningGenerator:
    """
    Générateur de planning d'étude intelligent
    """
    
    def __init__(self, user: User):
        """
        Initialise le générateur pour un utilisateur
        
        Args:
            user: Utilisateur pour lequel générer le planning
        """
        self.user = user
        self.matieres = list(user.matieres.all())
        self.taches = list(user.taches.filter(Tache.etat.in_(['a_faire', 'en_cours'])).all())
        self.emploi_du_temps = None
        
        # Récupérer l'emploi du temps s'il existe
        emplois = EmploiDuTemps.query.filter_by(utilisateur_id=user.id).all()
        if emplois:
            self.emploi_du_temps = emplois[0]  # Prendre le premier
    
    def generer_planning_automatique(self, date_debut: date, date_fin: date,
                                    heures_etude_par_jour: float = 4.0,
                                    jours_etude_par_semaine: int = 6,
                                    jours_repos: List[str] = None) -> Planning:
        """
        Génère un planning d'étude automatique optimisé
        
        Args:
            date_debut: Date de début du planning
            date_fin: Date de fin du planning
            heures_etude_par_jour: Nombre d'heures d'étude par jour
            jours_etude_par_semaine: Nombre de jours d'étude par semaine
            jours_repos: Liste des jours de repos (ex: ['dimanche'])
        
        Returns:
            Planning généré
        """
        if jours_repos is None:
            jours_repos = ['dimanche']
        
        # Créer le planning
        planning = Planning(
            utilisateur_id=self.user.id,
            nom=f"Planning {date_debut.strftime('%d/%m/%Y')} - {date_fin.strftime('%d/%m/%Y')}",
            description="Planning généré automatiquement",
            date_debut=date_debut,
            date_fin=date_fin,
            type_planning='automatique',
            heures_etude_par_jour=heures_etude_par_jour,
            jours_etude_par_semaine=jours_etude_par_semaine,
            jours_repos=','.join(jours_repos),
            algorithme_utilise='priority_based_scheduling',
            statut='actif'
        )
        
        db.session.add(planning)
        db.session.flush()  # Pour obtenir l'ID du planning
        
        # Calculer le score de qualité
        matieres_prioritaires = self._calculer_matieres_prioritaires()
        
        # Générer les sessions
        sessions = self._generer_sessions(
            planning=planning,
            date_debut=date_debut,
            date_fin=date_fin,
            heures_par_jour=heures_etude_par_jour,
            jours_repos=jours_repos,
            matieres_prioritaires=matieres_prioritaires
        )
        
        # Sauvegarder toutes les sessions
        for session in sessions:
            db.session.add(session)
        
        # Calculer les statistiques du planning
        planning.sessions_total = len(sessions)
        planning.score_qualite = self._calculer_score_qualite(sessions, matieres_prioritaires)
        
        db.session.commit()
        
        return planning
    
    def _calculer_matieres_prioritaires(self) -> List[Dict]:
        """
        Calcule la liste des matières avec leur priorité
        
        Returns:
            Liste de dictionnaires avec matière et score de priorité
        """
        matieres_prioritaires = []
        
        for matiere in self.matieres:
            score = 0
            
            # Critère 1 : Priorité de la matière (1-10)
            score += matiere.priorite * 10
            
            # Critère 2 : Urgence de l'examen
            if matiere.date_examen:
                jours_avant = matiere.jours_avant_examen()
                if jours_avant is not None:
                    if jours_avant <= 7:
                        score += 50  # Très urgent
                    elif jours_avant <= 14:
                        score += 30  # Urgent
                    elif jours_avant <= 30:
                        score += 15  # Moyennement urgent
            
            # Critère 3 : Niveau de difficulté
            score += matiere.niveau_difficulte * 5
            
            # Critère 4 : Progression (moins on a avancé, plus c'est prioritaire)
            progression_inverse = 100 - (matiere.pourcentage_complete or 0)
            score += progression_inverse * 0.3
            
            # Critère 5 : Coefficient
            if matiere.coefficient:
                score += matiere.coefficient * 5
            
            matieres_prioritaires.append({
                'matiere': matiere,
                'score': score
            })
        
        # Trier par score décroissant
        matieres_prioritaires.sort(key=lambda x: x['score'], reverse=True)
        
        return matieres_prioritaires
    
    def _generer_sessions(self, planning: Planning, date_debut: date,
                         date_fin: date, heures_par_jour: float,
                         jours_repos: List[str], 
                         matieres_prioritaires: List[Dict]) -> List[Session]:
        """
        Génère les sessions d'étude pour le planning
        
        Args:
            planning: Planning parent
            date_debut: Date de début
            date_fin: Date de fin
            heures_par_jour: Heures d'étude par jour
            jours_repos: Jours de repos
            matieres_prioritaires: Matières triées par priorité
        
        Returns:
            Liste de sessions générées
        """
        sessions = []
        date_courante = date_debut
        
        # Durée de session préférée de l'utilisateur (en minutes)
        duree_session = self.user.duree_session_preferee or 60
        
        # Calculer le nombre de sessions par jour
        sessions_par_jour = int((heures_par_jour * 60) / (duree_session + self.user.duree_pause))
        
        # Index pour alterner entre les matières
        matiere_index = 0
        
        while date_courante <= date_fin:
            # Vérifier si c'est un jour de repos
            jour_nom = self._get_jour_nom(date_courante)
            
            if jour_nom in jours_repos:
                date_courante += timedelta(days=1)
                continue
            
            # Vérifier s'il y a des cours ce jour-là
            cours_du_jour = []
            if self.emploi_du_temps:
                cours_du_jour = Cours.query.filter_by(
                    emploi_du_temps_id=self.emploi_du_temps.id,
                    jour=jour_nom
                ).order_by(Cours.heure_debut).all()
            
            # Générer les sessions pour ce jour
            sessions_jour = self._generer_sessions_jour(
                planning=planning,
                date=date_courante,
                duree_session=duree_session,
                sessions_par_jour=sessions_par_jour,
                cours_du_jour=cours_du_jour,
                matieres_prioritaires=matieres_prioritaires,
                matiere_index_start=matiere_index
            )
            
            sessions.extend(sessions_jour)
            matiere_index = (matiere_index + len(sessions_jour)) % len(matieres_prioritaires)
            
            date_courante += timedelta(days=1)
        
        return sessions
    
    def _generer_sessions_jour(self, planning: Planning, date: date,
                              duree_session: int, sessions_par_jour: int,
                              cours_du_jour: List[Cours],
                              matieres_prioritaires: List[Dict],
                              matiere_index_start: int) -> List[Session]:
        """
        Génère les sessions pour un jour donné
        
        Args:
            planning: Planning parent
            date: Date du jour
            duree_session: Durée d'une session en minutes
            sessions_par_jour: Nombre de sessions à créer
            cours_du_jour: Cours de la journée
            matieres_prioritaires: Matières triées par priorité
            matiere_index_start: Index de départ pour l'alternance
        
        Returns:
            Liste de sessions pour ce jour
        """
        sessions = []
        
        # Heures productives de l'utilisateur
        heure_debut_productive = self.user.heure_productive_debut or time(8, 0)
        heure_fin_productive = self.user.heure_productive_fin or time(22, 0)
        
        # Créneaux occupés par les cours
        creneaux_occupes = []
        for cours in cours_du_jour:
            creneaux_occupes.append({
                'debut': cours.heure_debut,
                'fin': cours.heure_fin
            })
        
        # Générer les créneaux disponibles
        creneaux_disponibles = self._trouver_creneaux_disponibles(
            heure_debut_productive,
            heure_fin_productive,
            creneaux_occupes,
            duree_session
        )
        
        # Créer les sessions dans les créneaux disponibles
        matiere_index = matiere_index_start
        
        for i, creneau in enumerate(creneaux_disponibles):
            if i >= sessions_par_jour:
                break
            
            # Choisir la matière (alternance intelligente)
            matiere_info = matieres_prioritaires[matiere_index % len(matieres_prioritaires)]
            matiere = matiere_info['matiere']
            
            # Chercher une tâche associée à cette matière
            tache = self._trouver_tache_pour_matiere(matiere)
            
            session = Session(
                planning_id=planning.id,
                matiere_id=matiere.id,
                tache_id=tache.id if tache else None,
                date=date,
                heure_debut=creneau['debut'],
                heure_fin=creneau['fin'],
                duree=duree_session,
                titre=f"Étude {matiere.nom}",
                description=f"Session d'étude pour {matiere.nom}",
                type_session='etude',
                completee=False
            )
            
            sessions.append(session)
            matiere_index += 1
        
        return sessions
    
    def _trouver_creneaux_disponibles(self, heure_debut: time, heure_fin: time,
                                     creneaux_occupes: List[Dict],
                                     duree_session: int) -> List[Dict]:
        """
        Trouve les créneaux disponibles dans une journée
        
        Args:
            heure_debut: Heure de début de journée
            heure_fin: Heure de fin de journée
            creneaux_occupes: Créneaux déjà occupés
            duree_session: Durée d'une session en minutes
        
        Returns:
            Liste de créneaux disponibles
        """
        creneaux_disponibles = []
        
        # Trier les créneaux occupés par heure de début
        creneaux_occupes_tries = sorted(creneaux_occupes, key=lambda x: x['debut'])
        
        heure_courante = heure_debut
        
        for creneau_occupe in creneaux_occupes_tries:
            # S'il y a de l'espace avant ce créneau occupé
            if self._temps_entre(heure_courante, creneau_occupe['debut']) >= duree_session:
                creneaux_disponibles.append({
                    'debut': heure_courante,
                    'fin': creneau_occupe['debut']
                })
            
            # Avancer l'heure courante
            heure_courante = max(heure_courante, creneau_occupe['fin'])
        
        # Vérifier s'il reste du temps après le dernier créneau occupé
        if self._temps_entre(heure_courante, heure_fin) >= duree_session:
            creneaux_disponibles.append({
                'debut': heure_courante,
                'fin': heure_fin
            })
        
        return creneaux_disponibles
    
    def _temps_entre(self, debut: time, fin: time) -> int:
        """
        Calcule le nombre de minutes entre deux heures
        
        Args:
            debut: Heure de début
            fin: Heure de fin
        
        Returns:
            Nombre de minutes
        """
        debut_minutes = debut.hour * 60 + debut.minute
        fin_minutes = fin.hour * 60 + fin.minute
        
        return max(0, fin_minutes - debut_minutes)
    
    def _trouver_tache_pour_matiere(self, matiere: Matiere) -> Optional[Tache]:
        """
        Trouve une tâche non complétée pour une matière
        
        Args:
            matiere: Matière concernée
        
        Returns:
            Tâche trouvée ou None
        """
        tache = Tache.query.filter_by(
            matiere_id=matiere.id,
            utilisateur_id=self.user.id
        ).filter(
            Tache.etat.in_(['a_faire', 'en_cours'])
        ).order_by(
            Tache.priorite.desc(),
            Tache.date_limite.asc()
        ).first()
        
        return tache
    
    def _calculer_score_qualite(self, sessions: List[Session],
                               matieres_prioritaires: List[Dict]) -> int:
        """
        Calcule un score de qualité pour le planning
        
        Args:
            sessions: Sessions du planning
            matieres_prioritaires: Matières avec priorités
        
        Returns:
            Score de qualité (0-100)
        """
        if not sessions:
            return 0
        
        score = 50  # Score de base
        
        # Critère 1 : Répartition équilibrée des matières
        matieres_count = {}
        for session in sessions:
            matiere_id = session.matiere_id
            matieres_count[matiere_id] = matieres_count.get(matiere_id, 0) + 1
        
        # Plus la répartition est équilibrée, mieux c'est
        if matieres_count:
            ecart_type = self._calculer_ecart_type(list(matieres_count.values()))
            score += max(0, 20 - ecart_type)
        
        # Critère 2 : Respect des priorités
        # Les matières prioritaires doivent avoir plus de sessions
        sessions_prioritaires = 0
        for session in sessions:
            for mp in matieres_prioritaires[:3]:  # Top 3
                if session.matiere_id == mp['matiere'].id:
                    sessions_prioritaires += 1
                    break
        
        ratio_prioritaires = sessions_prioritaires / len(sessions)
        score += ratio_prioritaires * 20
        
        # Critère 3 : Utilisation des créneaux libres
        if self.emploi_du_temps:
            score += 10  # Bonus pour intégration avec emploi du temps
        
        return min(int(score), 100)
    
    def _calculer_ecart_type(self, valeurs: List[int]) -> float:
        """
        Calcule l'écart-type d'une liste de valeurs
        
        Args:
            valeurs: Liste de valeurs
        
        Returns:
            Écart-type
        """
        if not valeurs:
            return 0
        
        moyenne = sum(valeurs) / len(valeurs)
        variance = sum((x - moyenne) ** 2 for x in valeurs) / len(valeurs)
        
        return variance ** 0.5
    
    def _get_jour_nom(self, date: date) -> str:
        """
        Retourne le nom du jour en français
        
        Args:
            date: Date
        
        Returns:
            Nom du jour
        """
        jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
        return jours[date.weekday()]
    
    @staticmethod
    def optimiser_planning_existant(planning: Planning) -> Dict:
        """
        Optimise un planning existant en réorganisant les sessions
        
        Args:
            planning: Planning à optimiser
        
        Returns:
            Résultat de l'optimisation
        """
        # TODO: Implémenter l'optimisation de planning existant
        # Pourrait utiliser des algorithmes génétiques ou du simulated annealing
        
        return {
            'success': True,
            'message': 'Optimisation non encore implémentée',
            'ancien_score': planning.score_qualite,
            'nouveau_score': planning.score_qualite
        }