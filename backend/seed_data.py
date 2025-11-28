#!/usr/bin/env python3
"""
Script pour insérer des données de test riches dans la base de données
Version personnalisée pour Sirine et Safa
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Ajouter le dossier parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Matiere, Tache, Planning, Session, Notification, EmploiDuTemps, Cours


def create_users():
    """Créer les utilisateurs de test"""
    print("👥 Création des utilisateurs...")
    
    users_data = [
        {
            'nom': 'Sirine Abdelkhalek',
            'email': 'sirine.abdelkhalek@test.com',
            'mot_de_passe': 'Sirine1234',
            'niveau': 'cycle_ingenieur5',
            'role': 'etudiant',
            'langue': 'fr',
            'heure_productive_debut': '08:00',
            'heure_productive_fin': '22:00',
            'duree_session_preferee': 90,
            'duree_pause': 15
        },
        {
            'nom': 'Safa Elmathlouthi',
            'email': 'safa.elmathlouthi@test.com',
            'mot_de_passe': 'Safa1234',
            'niveau': 'cycle_ingenieur5',
            'role': 'etudiant',
            'langue': 'fr',
            'heure_productive_debut': '09:00',
            'heure_productive_fin': '23:00',
            'duree_session_preferee': 60,
            'duree_pause': 10
        },
        {
            'nom': 'Admin Test',
            'email': 'admin@test.com',
            'mot_de_passe': 'Admin1234',
            'niveau': None,
            'role': 'admin',
            'langue': 'fr',
            'heure_productive_debut': '09:00',
            'heure_productive_fin': '18:00',
            'duree_session_preferee': 90,
            'duree_pause': 20
        }
    ]
    
    users = []
    for user_data in users_data:
        user = User(**user_data)
        db.session.add(user)
        users.append(user)
    
    db.session.commit()
    print(f"✅ {len(users)} utilisateurs créés")
    return users


def create_matieres(user):
    """Créer les matières pour un utilisateur"""
    print(f"📚 Création des matières pour {user.nom}...")
    
    matieres_data = [
        {
            'nom': 'Développement iOS',
            'code': 'DevIOS301',
            'description': 'Développement d\'applications iOS avancées avec Swift et SwiftUI',
            'couleur': '#3B82F6',
            'credits': 4,
            'coefficient': 2.0,
            'semestre': 'S5',
            'priorite': 8,
            'niveau_difficulte': 7,
            'date_examen': datetime.utcnow() + timedelta(days=28),
            'type_examen': 'pratique',
            'temps_estime_total': 4200  # 70 heures
        },
        {
            'nom': 'Qualité Logicielle et Automatisation des Tests',
            'code': 'QA301',
            'description': 'Techniques de test et assurance qualité logicielle',
            'couleur': '#10B981',
            'credits': 3,
            'coefficient': 1.5,
            'semestre': 'S5',
            'priorite': 7,
            'niveau_difficulte': 6,
            'date_examen': datetime.utcnow() + timedelta(days=32),
            'type_examen': 'mixte',
            'temps_estime_total': 3600  # 60 heures
        },
        {
            'nom': 'Framework Django',
            'code': 'Django301',
            'description': 'Développement web full-stack avec Django et REST Framework',
            'couleur': '#F59E0B',
            'credits': 5,
            'coefficient': 2.0,
            'semestre': 'S5',
            'priorite': 9,
            'niveau_difficulte': 8,
            'date_examen': datetime.utcnow() + timedelta(days=35),
            'type_examen': 'pratique',
            'temps_estime_total': 5400  # 90 heures
        },
        {
            'nom': 'Web Marketing',
            'code': 'WM301',
            'description': 'Stratégies de marketing digital, SEO et analytics',
            'couleur': '#EF4444',
            'credits': 3,
            'coefficient': 1.0,
            'semestre': 'S5',
            'priorite': 5,
            'niveau_difficulte': 4,
            'date_examen': datetime.utcnow() + timedelta(days=40),
            'type_examen': 'ecrit',
            'temps_estime_total': 2400  # 40 heures
        },
        {
            'nom': 'React',
            'code': 'React301',
            'description': 'Développement d\'applications web modernes avec React et Redux',
            'couleur': '#61DAFB',
            'credits': 4,
            'coefficient': 2.0,
            'semestre': 'S5',
            'priorite': 8,
            'niveau_difficulte': 7,
            'date_examen': datetime.utcnow() + timedelta(days=30),
            'type_examen': 'pratique',
            'temps_estime_total': 4800  # 80 heures
        },
        {
            'nom': 'Machine Learning et Deep Learning',
            'code': 'ML_DL301',
            'description': 'Techniques avancées d\'intelligence artificielle et réseaux de neurones',
            'couleur': '#8B5CF6',
            'credits': 5,
            'coefficient': 2.5,
            'semestre': 'S5',
            'priorite': 10,
            'niveau_difficulte': 9,
            'date_examen': datetime.utcnow() + timedelta(days=25),
            'type_examen': 'mixte',
            'temps_estime_total': 6000  # 100 heures
        },
        {
            'nom': 'Apprentissage et Fouille de Données',
            'code': 'DataMining301',
            'description': 'Techniques de data mining, clustering et visualisation',
            'couleur': '#EC4899',
            'credits': 4,
            'coefficient': 2.0,
            'semestre': 'S5',
            'priorite': 9,
            'niveau_difficulte': 8,
            'date_examen': datetime.utcnow() + timedelta(days=27),
            'type_examen': 'mixte',
            'temps_estime_total': 4800  # 80 heures
        }
    ]
    
    matieres = []
    for mat_data in matieres_data:
        matiere = Matiere(user_id=user.id, **mat_data)
        db.session.add(matiere)
        matieres.append(matiere)
    
    db.session.commit()
    print(f"✅ {len(matieres)} matières créées")
    return matieres


def create_taches(user, matieres):
    """Créer des tâches pour un utilisateur"""
    print(f"✏️ Création des tâches pour {user.nom}...")
    
    taches_data = [
        # Développement iOS
        {
            'titre': 'Développement application Fuego Vibe',
            'description': 'Créer une application iOS pour le suivi des événements musicaux',
            'type_tache': 'projet',
            'priorite': 10,
            'niveau_difficulte': 8,
            'duree_estimee': 360,
            'etat': 'en_cours',
            'pourcentage_complete': 45,
            'tags': 'ios,swift,projet',
            'date_limite': datetime.utcnow() + timedelta(days=14)
        },
        # Qualité Logicielle
        {
            'titre': 'Projet tests automatisés',
            'description': 'Mettre en place des tests unitaires et d\'intégration',
            'type_tache': 'projet',
            'priorite': 9,
            'niveau_difficulte': 7,
            'duree_estimee': 180,
            'etat': 'en_cours',
            'pourcentage_complete': 60,
            'tags': 'qa,testing',
            'date_limite': datetime.utcnow() + timedelta(days=10)
        },
        # Django
        {
            'titre': 'Projet Django REST API',
            'description': 'Développer une API REST complète avec authentification JWT',
            'type_tache': 'projet',
            'priorite': 10,
            'niveau_difficulte': 8,
            'duree_estimee': 240,
            'etat': 'en_cours',
            'pourcentage_complete': 35,
            'tags': 'django,rest-api',
            'date_limite': datetime.utcnow() + timedelta(days=20)
        },
        # React
        {
            'titre': 'Projet React Dashboard',
            'description': 'Créer un dashboard interactif avec React et Tailwind',
            'type_tache': 'projet',
            'priorite': 9,
            'niveau_difficulte': 7,
            'duree_estimee': 200,
            'etat': 'en_cours',
            'pourcentage_complete': 50,
            'tags': 'react,frontend',
            'date_limite': datetime.utcnow() + timedelta(days=15)
        },
        # Machine Learning
        {
            'titre': 'Projet ML - Prédiction',
            'description': 'Créer un modèle de régression',
            'type_tache': 'projet',
            'priorite': 10,
            'niveau_difficulte': 9,
            'duree_estimee': 300,
            'etat': 'en_cours',
            'pourcentage_complete': 25,
            'tags': 'ml,regression',
            'date_limite': datetime.utcnow() + timedelta(days=18)
        },
        # Data Mining
        {
            'titre': 'Révision chapitres 1 à 3',
            'description': 'Revoir les fondamentaux du data mining',
            'type_tache': 'revision',
            'priorite': 9,
            'niveau_difficulte': 7,
            'duree_estimee': 120,
            'etat': 'en_cours',
            'pourcentage_complete': 65,
            'tags': 'data-mining',
            'date_limite': datetime.utcnow() + timedelta(days=5)
        }
    ]
    
    taches = []
    for i, tache_data in enumerate(taches_data):
        tache = Tache(
            user_id=user.id,
            matiere_id=matieres[i].id,
            **tache_data
        )
        
        if tache.etat == 'en_cours':
            tache.date_debut = datetime.utcnow() - timedelta(days=random.randint(1, 3))
            tache.temps_passe = int(tache.duree_estimee * tache.pourcentage_complete / 100)
        
        db.session.add(tache)
        taches.append(tache)
    
    db.session.commit()
    print(f"✅ {len(taches)} tâches créées")
    return taches


def seed_all():
    """Fonction principale"""
    app = create_app('development')
    
    with app.app_context():
        try:
            print("\n" + "="*70)
            print("🌱 INSERTION DES DONNÉES - VERSION PERSONNALISÉE")
            print("="*70 + "\n")
            
            if User.query.first():
                print("⚠️  Des données existent déjà.")
                response = input("Supprimer et recréer ? (yes/no): ")
                if response.lower() != 'yes':
                    return False
                
                Notification.query.delete()
                Session.query.delete()
                Cours.query.delete()
                EmploiDuTemps.query.delete()
                Planning.query.delete()
                Tache.query.delete()
                Matiere.query.delete()
                User.query.delete()
                db.session.commit()
                print("✅ Données supprimées")
            
            users = create_users()
            
            for user in users[:2]:  # Sirine et Safa
                matieres = create_matieres(user)
                taches = create_taches(user, matieres)
            
            print("\n" + "="*70)
            print("🎉 DONNÉES INSÉRÉES AVEC SUCCÈS !")
            print("="*70)
            
            print("\n📝 COMPTES:")
            print("\n👩‍💻 Sirine: sirine.abdelkhalek@test.com / Sirine1234")
            print("👩‍💻 Safa: safa.elmathlouthi@test.com / Safa1234")
            print("👨‍💼 Admin: admin@test.com / Admin1234")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ ERREUR: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == '__main__':
    success = seed_all()
    sys.exit(0 if success else 1)
    