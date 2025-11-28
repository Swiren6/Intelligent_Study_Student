"""
Script d'initialisation de la base de données
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Matiere, Tache, Planning, Session, Notification, EmploiDuTemps, Cours

def init_database():
    """Initialise la base de données"""
    print("🔧 Initialisation de la base de données...")
    
    app = create_app('development')
    
    with app.app_context():
        try:
            # Créer toutes les tables
            db.create_all()
            print("✅ Tables créées avec succès!")
            
            # Afficher les tables créées
            print("\n📋 Tables créées:")
            inspector = db.inspect(db.engine)
            for table_name in inspector.get_table_names():
                print(f"  - {table_name}")
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur lors de l'initialisation: {e}")
            return False

def reset_database():
    """Réinitialise complètement la base de données"""
    print("⚠️  ATTENTION: Cette opération va supprimer toutes les données!")
    response = input("Êtes-vous sûr de vouloir continuer? (yes/no): ")
    
    if response.lower() != 'yes':
        print("❌ Opération annulée")
        return False
    
    print("\n🔄 Réinitialisation de la base de données...")
    
    app = create_app('development')
    
    with app.app_context():
        try:
            # Supprimer toutes les tables
            db.drop_all()
            print("✅ Tables supprimées")
            
            # Recréer toutes les tables
            db.create_all()
            print("✅ Tables recréées")
            
            print("\n🎉 Base de données réinitialisée avec succès!")
            return True
            
        except Exception as e:
            print(f"❌ Erreur lors de la réinitialisation: {e}")
            return False

def seed_database():
    """Remplit la base de données avec des données de test"""
    from datetime import datetime, timedelta
    
    print("🌱 Insertion des données de test...")
    
    app = create_app('development')
    
    with app.app_context():
        try:
            # Vérifier si des utilisateurs existent déjà
            if User.query.first():
                print("⚠️  Des utilisateurs existent déjà. Voulez-vous continuer? (yes/no)")
                if input().lower() != 'yes':
                    print("❌ Opération annulée")
                    return False
            
            # Créer un utilisateur de test
            test_user = User(
                nom='Étudiant Test',
                email='test@test.com',
                mot_de_passe='Test1234',
                niveau='cycle_ingenieur5',
                langue='fr'
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"✅ Utilisateur créé: {test_user.email}")
            
            # Créer un admin de test
            admin_user = User(
                nom='Admin Test',
                email='admin@test.com',
                mot_de_passe='Admin1234',
                role='admin',
                langue='fr'
            )
            db.session.add(admin_user)
            db.session.commit()
            print(f"✅ Admin créé: {admin_user.email}")
            
            # Créer des matières de test
            matieres_data = [
                {
                    'nom': 'Dévoloppement iOS',
                    'code': 'DevIOS301',
                    'couleur': '#3B82F6',
                    'priorite': 8,
                    'niveau_difficulte': 7,
                    'description': 'Développement d\'applications iOS avancées'
                },
                {
                    'nom': 'Qualité logicielle et automatisation des tests',
                    'code': 'QA301',
                    'couleur': '#10B981',
                    'priorite': 7,
                    'niveau_difficulte': 6,
                    'description': 'Techniques de test et assurance qualité logicielle'
                },
                {
                    'nom': 'FrameWork Django',
                    'code': 'Django301',
                    'couleur': '#F59E0B',
                    'priorite': 9,
                    'niveau_difficulte': 8,
                    'description': 'Développement web avec Django'
                },
                {
                    'nom': 'Web Marketing',
                    'code': 'WM301',
                    'couleur': '#EF4444',
                    'priorite': 5,
                    'niveau_difficulte': 4,
                    'description': 'Web marketing et SEO'
                },
                {
                    'nom': 'React',
                    'code': 'react301',
                    'couleur': '#EF4444',
                    'priorite': 5,
                    'niveau_difficulte': 4,
                    'description': 'Développement d\'applications web :ed FLow avec React'
                },
                {
                    'nom': 'Machine learning et deep learning',
                    'code': 'ML/DL301',
                    'couleur': '#8B5CF6',
                    'priorite': 9,
                    'niveau_difficulte': 9,
                    'description': 'Techniques avancées d\'intelligence artificielle'
                },
                {
                    'nom': 'Apprentissage et Fouille de données',
                    'code': 'DataMining301',
                    'couleur': '#EF4444',
                    'priorite': 8,
                    'niveau_difficulte': 7,
                    'description': 'Techniques de data mining et analyse de données'
                }
            ]
            
            matieres = []
            for mat_data in matieres_data:
                matiere = Matiere(
                    user_id=test_user.id,
                    **mat_data,
                    credits=3,
                    coefficient=1.5,
                    semestre='S5',
                    date_examen=datetime.utcnow() + timedelta(days=30),
                    temps_estime_total=3600  # 60 heures
                )
                db.session.add(matiere)
                matieres.append(matiere)
            
            db.session.commit()
            print(f"✅ {len(matieres_data)} matières créées")
            
            # Créer des tâches de test
            taches_data = [
                {
                    'titre': "Developpement d'application fuego Vibe",
                    'description': 'Créer une application iOS pour le suivi des evenements',
                    'type_tache': 'projet',
                    'priorite': 8,
                    'duree_estimee': 120
                },
                {
                    'titre': 'revision des chapitres 1 à 3 Data Mining',
                    'description': 'Résoudre les exercices 1 à 10 du TD1',
                    'type_tache': 'exercice',
                    'priorite': 7,
                    'duree_estimee': 90
                },
                {
                    'titre': 'Projet Qualité Logicielle',
                    'description': 'Mettre en place des tests automatisés pour l\'application web',
                    'type_tache': 'projet',
                    'priorite': 9,
                    'duree_estimee': 180
                }
            ]
            
            for i, tache_data in enumerate(taches_data):
                tache = Tache(
                    user_id=test_user.id,
                    matiere_id=matieres[i % len(matieres)].id,
                    date_limite=datetime.utcnow() + timedelta(days=7 + i),
                    **tache_data
                )
                db.session.add(tache)
            
            db.session.commit()
            print(f"✅ {len(taches_data)} tâches créées")
            
            print("\n🎉 Données de test insérées avec succès!")
            print("\n📝 Informations de connexion:")
            print(f"\n👤 Étudiant:")
            print(f"   Email: {test_user.email}")
            print(f"   Mot de passe: Test1234")
            print(f"\n👨‍💼 Admin:")
            print(f"   Email: {admin_user.email}")
            print(f"   Mot de passe: Admin1234")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Erreur lors de l'insertion des données: {e}")
            import traceback
            traceback.print_exc()
            return False

def check_connection():
    """Vérifie la connexion à la base de données"""
    print("🔍 Vérification de la connexion à la base de données...")
    
    app = create_app('development')
    
    with app.app_context():
        try:
            # Essayer une requête simple
            db.session.execute(db.text('SELECT 1'))
            print("✅ Connexion à la base de données réussie!")
            
            # Afficher les informations de connexion
            print(f"\n📊 Informations:")
            print(f"   URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
            
            # Compter les utilisateurs
            user_count = User.query.count()
            print(f"   Utilisateurs: {user_count}")
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur de connexion: {e}")
            print("\n💡 Vérifiez que:")
            print("   1. PostgreSQL est démarré")
            print("   2. Les informations de connexion dans .env sont correctes")
            print("   3. La base de données 'study_assistant_db' existe")
            print("   4. L'utilisateur 'study_user' a les permissions nécessaires")
            return False

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python init_db.py init     - Initialiser la base de données")
        print("  python init_db.py reset    - Réinitialiser la base de données")
        print("  python init_db.py seed     - Insérer des données de test")
        print("  python init_db.py check    - Vérifier la connexion")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'init':
        success = init_database()
    elif command == 'reset':
        success = reset_database()
    elif command == 'seed':
        success = seed_database()
    elif command == 'check':
        success = check_connection()
    else:
        print(f"❌ Commande inconnue: {command}")
        success = False
    
    sys.exit(0 if success else 1)