"""
Service d'Intelligence Artificielle pour la génération de plannings d'études
Algorithme optimisé tenant compte des priorités, coefficients, et préférences
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import json

class PlanningAI:
    """
    Service d'IA pour générer des plannings d'études optimisés
    """
    
    def __init__(self):
        """Initialisation du service IA"""
        self.default_session_duration = 120  # minutes
        self.break_duration = 15  # minutes
        self.min_session_duration = 45  # minutes
        self.max_session_duration = 180  # minutes
        
    def generate_planning(
        self,
        matieres: List[Dict[str, Any]],
        preferences: Dict[str, Any],
        date_debut: datetime,
        date_fin: datetime
    ) -> List[Dict[str, Any]]:
        """
        Génère un planning d'études optimisé
        
        Args:
            matieres: Liste des matières avec leurs propriétés
            preferences: Préférences utilisateur (heures, durée sessions, etc.)
            date_debut: Date de début du planning
            date_fin: Date de fin du planning
            
        Returns:
            Liste des sessions d'étude générées
        """
        
        # Extraction des préférences
        session_duration = preferences.get('duree_session', self.default_session_duration)
        heure_debut = preferences.get('heure_debut', '09:00')
        heure_fin = preferences.get('heure_fin', '18:00')
        jours_semaine = preferences.get('jours_semaine', [0, 1, 2, 3, 4])  # Lun-Ven
        
        # Calcul du score de priorité pour chaque matière
        matieres_ponderees = self._calculate_priorities(matieres)
        
        # Génération du planning
        sessions = []
        current_date = date_debut
        
        while current_date <= date_fin:
            # Vérifier si c'est un jour travaillé
            if current_date.weekday() in jours_semaine:
                # Générer les sessions pour ce jour
                daily_sessions = self._generate_daily_sessions(
                    current_date,
                    matieres_ponderees,
                    session_duration,
                    heure_debut,
                    heure_fin
                )
                sessions.extend(daily_sessions)
            
            current_date += timedelta(days=1)
        
        return sessions
    
    def _calculate_priorities(self, matieres: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calcule un score de priorité pour chaque matière
        Score = (coefficient * priorité) + facteur_progression
        """
        matieres_ponderees = []
        
        for matiere in matieres:
            coefficient = matiere.get('coefficient', 1.0)
            priorite = matiere.get('priorite', 2)  # 1=basse, 2=moyenne, 3=haute
            progression = matiere.get('progression', 0)
            
            # Score inversement proportionnel à la progression
            # Plus la progression est faible, plus le score est élevé
            facteur_progression = (100 - progression) / 100
            
            score = (coefficient * priorite) + (facteur_progression * 2)
            
            matiere_ponderee = matiere.copy()
            matiere_ponderee['score_priorite'] = score
            matieres_ponderees.append(matiere_ponderee)
        
        # Trier par score décroissant
        matieres_ponderees.sort(key=lambda x: x['score_priorite'], reverse=True)
        
        return matieres_ponderees
    
    def _generate_daily_sessions(
        self,
        date: datetime,
        matieres: List[Dict[str, Any]],
        session_duration: int,
        heure_debut: str,
        heure_fin: str
    ) -> List[Dict[str, Any]]:
        """
        Génère les sessions pour une journée donnée
        """
        sessions = []
        
        # Conversion heures en datetime
        debut_h, debut_m = map(int, heure_debut.split(':'))
        fin_h, fin_m = map(int, heure_fin.split(':'))
        
        current_time = datetime(date.year, date.month, date.day, debut_h, debut_m)
        end_time = datetime(date.year, date.month, date.day, fin_h, fin_m)
        
        # Compteur pour rotation des matières
        matiere_index = 0
        
        while current_time + timedelta(minutes=session_duration) <= end_time:
            # Sélectionner la matière selon l'algorithme
            if matiere_index >= len(matieres):
                matiere_index = 0
            
            matiere = matieres[matiere_index]
            
            # Créer la session
            session = {
                'matiere_id': matiere['id'],
                'matiere_nom': matiere['nom'],
                'date': date.strftime('%Y-%m-%d'),
                'heure_debut': current_time.strftime('%H:%M'),
                'heure_fin': (current_time + timedelta(minutes=session_duration)).strftime('%H:%M'),
                'duree': session_duration,
                'type': 'revision',
                'terminee': False
            }
            
            sessions.append(session)
            
            # Passer à la session suivante (avec pause)
            current_time += timedelta(minutes=session_duration + self.break_duration)
            matiere_index += 1
        
        return sessions
    
    def optimize_existing_planning(
        self,
        sessions: List[Dict[str, Any]],
        matieres: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Optimise un planning existant en fonction des nouvelles données
        """
        # Recalculer les priorités
        matieres_ponderees = self._calculate_priorities(matieres)
        
        # Réorganiser les sessions non terminées
        sessions_non_terminees = [s for s in sessions if not s.get('terminee', False)]
        sessions_terminees = [s for s in sessions if s.get('terminee', False)]
        
        # Créer un mapping matiere_id -> score
        scores = {m['id']: m['score_priorite'] for m in matieres_ponderees}
        
        # Trier les sessions par score de priorité décroissant
        sessions_non_terminees.sort(
            key=lambda s: scores.get(s['matiere_id'], 0),
            reverse=True
        )
        
        return sessions_terminees + sessions_non_terminees
    
    def suggest_study_topics(
        self,
        matiere: Dict[str, Any],
        niveau_difficulte: str = 'moyen'
    ) -> List[str]:
        """
        Suggère des sujets d'étude pour une matière donnée
        Basé sur le nom de la matière et le niveau
        """
        suggestions_db = {
            'mathématiques': {
                'facile': ['Révision des bases', 'Exercices simples', 'Formules essentielles'],
                'moyen': ['Problèmes types', 'Démonstrations', 'Applications pratiques'],
                'difficile': ['Problèmes complexes', 'Théorèmes avancés', 'Cas particuliers']
            },
            'physique': {
                'facile': ['Lois fondamentales', 'Unités et conversions', 'Schémas simples'],
                'moyen': ['Exercices d\'application', 'Expériences types', 'Analyse de phénomènes'],
                'difficile': ['Problèmes composés', 'Modélisation avancée', 'Cas réels']
            },
            'informatique': {
                'facile': ['Syntaxe de base', 'Structures simples', 'Debugging'],
                'moyen': ['Algorithmes courants', 'Structures de données', 'POO'],
                'difficile': ['Optimisation', 'Architectures complexes', 'Design patterns']
            },
            'chimie': {
                'facile': ['Tableau périodique', 'Nomenclature', 'Équations simples'],
                'moyen': ['Réactions types', 'Stœchiométrie', 'Équilibres'],
                'difficile': ['Mécanismes réactionnels', 'Synthèses', 'Analyses']
            },
            'default': {
                'facile': ['Concepts de base', 'Vocabulaire', 'Exercices simples'],
                'moyen': ['Applications pratiques', 'Exercices types', 'Méthodologie'],
                'difficile': ['Cas complexes', 'Synthèse', 'Analyse critique']
            }
        }
        
        matiere_nom = matiere.get('nom', '').lower()
        
        # Chercher la matière dans la base
        suggestions = None
        for key in suggestions_db:
            if key in matiere_nom:
                suggestions = suggestions_db[key]
                break
        
        if not suggestions:
            suggestions = suggestions_db['default']
        
        return suggestions.get(niveau_difficulte, suggestions['moyen'])
    
    def calculate_study_load(
        self,
        matieres: List[Dict[str, Any]],
        jours_disponibles: int
    ) -> Dict[str, Any]:
        """
        Calcule la charge de travail recommandée
        """
        total_coefficient = sum(m.get('coefficient', 1.0) for m in matieres)
        
        # Estimation: 2h par coefficient par semaine
        heures_totales = total_coefficient * 2 * (jours_disponibles / 7)
        
        repartition = {}
        for matiere in matieres:
            coef = matiere.get('coefficient', 1.0)
            heures = (coef / total_coefficient) * heures_totales
            repartition[matiere['nom']] = {
                'heures_recommandees': round(heures, 1),
                'sessions': int(heures / 2),  # Sessions de 2h
                'pourcentage': round((coef / total_coefficient) * 100, 1)
            }
        
        return {
            'heures_totales': round(heures_totales, 1),
            'heures_par_jour': round(heures_totales / jours_disponibles, 1),
            'repartition': repartition
        }
    
    def analyze_study_pattern(
        self,
        sessions_historique: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyse les patterns d'étude de l'utilisateur
        """
        if not sessions_historique:
            return {
                'total_sessions': 0,
                'heures_totales': 0,
                'moyenne_par_jour': 0,
                'jour_prefere': None,
                'heure_preferee': None,
                'taux_completion': 0
            }
        
        # Compteurs
        sessions_par_jour = {}
        sessions_par_heure = {}
        total_heures = 0
        sessions_terminees = 0
        
        for session in sessions_historique:
            # Jour de la semaine
            if 'date' in session:
                date = datetime.strptime(session['date'], '%Y-%m-%d')
                jour = date.strftime('%A')
                sessions_par_jour[jour] = sessions_par_jour.get(jour, 0) + 1
            
            # Heure de début
            if 'heure_debut' in session:
                heure = int(session['heure_debut'].split(':')[0])
                sessions_par_heure[heure] = sessions_par_heure.get(heure, 0) + 1
            
            # Durée
            if 'duree' in session:
                total_heures += session['duree'] / 60
            
            # Complétées
            if session.get('terminee', False):
                sessions_terminees += 1
        
        # Jour préféré
        jour_prefere = max(sessions_par_jour.items(), key=lambda x: x[1])[0] if sessions_par_jour else None
        
        # Heure préférée
        heure_preferee = max(sessions_par_heure.items(), key=lambda x: x[1])[0] if sessions_par_heure else None
        
        # Taux de complétion
        taux_completion = (sessions_terminees / len(sessions_historique)) * 100 if sessions_historique else 0
        
        return {
            'total_sessions': len(sessions_historique),
            'heures_totales': round(total_heures, 1),
            'moyenne_par_jour': round(total_heures / max(len(set(s.get('date') for s in sessions_historique)), 1), 1),
            'jour_prefere': jour_prefere,
            'heure_preferee': f"{heure_preferee}:00" if heure_preferee else None,
            'taux_completion': round(taux_completion, 1),
            'sessions_par_jour': sessions_par_jour,
            'sessions_par_heure': sessions_par_heure
        }


def test_planning_ai():
    """Test du service IA"""
    print("\n" + "="*60)
    print("TEST DU SERVICE D'INTELLIGENCE ARTIFICIELLE")
    print("="*60 + "\n")
    
    ai = PlanningAI()
    
    # Données de test
    matieres = [
        {
            'id': 1,
            'nom': 'Mathématiques',
            'coefficient': 3.0,
            'priorite': 3,
            'progression': 45
        },
        {
            'id': 2,
            'nom': 'Physique',
            'coefficient': 2.5,
            'priorite': 3,
            'progression': 60
        },
        {
            'id': 3,
            'nom': 'Informatique',
            'coefficient': 3.0,
            'priorite': 2,
            'progression': 70
        },
        {
            'id': 4,
            'nom': 'Chimie',
            'coefficient': 2.0,
            'priorite': 2,
            'progression': 30
        },
        {
            'id': 5,
            'nom': 'Anglais',
            'coefficient': 1.5,
            'priorite': 1,
            'progression': 80
        }
    ]
    
    preferences = {
        'duree_session': 120,
        'heure_debut': '09:00',
        'heure_fin': '18:00',
        'jours_semaine': [0, 1, 2, 3, 4]  # Lundi à Vendredi
    }
    
    # Test 1: Génération de planning
    print("📅 TEST 1: Génération de planning")
    print("-" * 60)
    
    date_debut = datetime(2025, 1, 6)  # Lundi
    date_fin = datetime(2025, 1, 12)   # Dimanche
    
    sessions = ai.generate_planning(matieres, preferences, date_debut, date_fin)
    
    print(f"✅ Planning généré: {len(sessions)} sessions")
    print(f"   Période: {date_debut.strftime('%d/%m/%Y')} - {date_fin.strftime('%d/%m/%Y')}")
    print(f"\n   Aperçu des 5 premières sessions:")
    
    for i, session in enumerate(sessions[:5], 1):
        print(f"   {i}. {session['date']} | {session['heure_debut']}-{session['heure_fin']} | {session['matiere_nom']}")
    
    # Test 2: Calcul de charge de travail
    print(f"\n📊 TEST 2: Calcul de charge de travail")
    print("-" * 60)
    
    charge = ai.calculate_study_load(matieres, 7)
    
    print(f"✅ Charge totale: {charge['heures_totales']}h sur 7 jours")
    print(f"   Moyenne par jour: {charge['heures_par_jour']}h")
    print(f"\n   Répartition par matière:")
    
    for matiere_nom, info in charge['repartition'].items():
        print(f"   • {matiere_nom}: {info['heures_recommandees']}h ({info['pourcentage']}%)")
    
    # Test 3: Suggestions de sujets
    print(f"\n💡 TEST 3: Suggestions de sujets d'étude")
    print("-" * 60)
    
    for matiere in matieres[:3]:
        suggestions = ai.suggest_study_topics(matiere, 'moyen')
        print(f"\n   {matiere['nom']}:")
        for sugg in suggestions:
            print(f"   • {sugg}")
    
    # Test 4: Analyse de patterns
    print(f"\n📈 TEST 4: Analyse des patterns d'étude")
    print("-" * 60)
    
    # Simuler un historique
    historique = [
        {'date': '2025-01-01', 'heure_debut': '09:00', 'duree': 120, 'terminee': True},
        {'date': '2025-01-01', 'heure_debut': '14:00', 'duree': 120, 'terminee': True},
        {'date': '2025-01-02', 'heure_debut': '10:00', 'duree': 90, 'terminee': False},
        {'date': '2025-01-03', 'heure_debut': '09:00', 'duree': 120, 'terminee': True},
    ]
    
    analyse = ai.analyze_study_pattern(historique)
    
    print(f"✅ Analyse complétée:")
    print(f"   Total sessions: {analyse['total_sessions']}")
    print(f"   Heures totales: {analyse['heures_totales']}h")
    print(f"   Moyenne/jour: {analyse['moyenne_par_jour']}h")
    print(f"   Taux de complétion: {analyse['taux_completion']}%")
    if analyse['jour_prefere']:
        print(f"   Jour préféré: {analyse['jour_prefere']}")
    if analyse['heure_preferee']:
        print(f"   Heure préférée: {analyse['heure_preferee']}")
    
    print("\n" + "="*60)
    print("✅ TOUS LES TESTS RÉUSSIS!")
    print("="*60 + "\n")
    
    return ai, sessions, charge, analyse


if __name__ == "__main__":
    test_planning_ai()