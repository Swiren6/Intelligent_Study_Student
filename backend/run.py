"""
Point d'entrée principal de l'application
Assistant Intelligent d'Organisation des Études
"""

import os
from app import create_app, db
from app.models import User, Matiere, Tache, Planning, Session, Notification, EmploiDuTemps, Cours

# Créer l'application avec l'environnement approprié
config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name)


@app.shell_context_processor
def make_shell_context():
    """
    Rend les objets disponibles automatiquement dans le shell Flask
    Utilisation: flask shell
    """
    return {
        'db': db,
        'User': User,
        'Matiere': Matiere,
        'Tache': Tache,
        'Planning': Planning,
        'Session': Session,
        'Notification': Notification,
        'EmploiDuTemps': EmploiDuTemps,
        'Cours': Cours
    }


@app.cli.command()
def init_db():
    """
    Initialise la base de données
    Utilisation: flask init-db
    """
    db.create_all()
    print('✓ Base de données initialisée avec succès!')


@app.cli.command()
def seed_db():
    """
    Remplit la base de données avec des données de test
    Utilisation: flask seed-db
    """
    from datetime import datetime, timedelta
    
    print('🌱 Insertion des données de test...')
    
    # Créer un utilisateur de test
    test_user = User(
        nom='Étudiant Test',
        email='etudiant@test.com',
        mot_de_passe='Test1234',
        niveau='Licence 3',
        langue='fr'
    )
    db.session.add(test_user)
    db.session.commit()
    print(f'✓ Utilisateur créé: {test_user.email}')
    
    # Créer des matières de test
    matieres_data = [
        {'nom': 'Mathématiques', 'code': 'MATH301', 'couleur': '#3B82F6', 'priorite': 8},
        {'nom': 'Physique', 'code': 'PHYS301', 'couleur': '#10B981', 'priorite': 7},
        {'nom': 'Informatique', 'code': 'INFO301', 'couleur': '#F59E0B', 'priorite': 9},
        {'nom': 'Anglais', 'code': 'ANG301', 'couleur': '#EF4444', 'priorite': 5},
    ]
    
    for mat_data in matieres_data:
        matiere = Matiere(
            user_id=test_user.id,
            **mat_data,
            credits=3,
            coefficient=1.5,
            date_examen=datetime.utcnow() + timedelta(days=30)
        )
        db.session.add(matiere)
    
    db.session.commit()
    print(f'✓ {len(matieres_data)} matières créées')
    
    # Créer quelques tâches de test
    matieres = Matiere.query.filter_by(user_id=test_user.id).all()
    
    for i, matiere in enumerate(matieres[:2]):
        tache = Tache(
            titre=f'Révision chapitre {i+1}',
            user_id=test_user.id,
            matiere_id=matiere.id,
            description=f'Réviser le chapitre {i+1} de {matiere.nom}',
            date_limite=datetime.utcnow() + timedelta(days=7),
            priorite=7,
            duree_estimee=120
        )
        db.session.add(tache)
    
    db.session.commit()
    print('✓ Tâches de test créées')
    
    print('\n🎉 Données de test insérées avec succès!')
    print('\nInformations de connexion:')
    print(f'Email: {test_user.email}')
    print('Mot de passe: Test1234')


@app.cli.command()
def drop_db():
    """
    Supprime toutes les tables de la base de données
    Utilisation: flask drop-db
    """
    if input('⚠️  Êtes-vous sûr de vouloir supprimer toutes les tables? (yes/no): ').lower() == 'yes':
        db.drop_all()
        print('✓ Toutes les tables ont été supprimées')
    else:
        print('❌ Opération annulée')


@app.cli.command()
def reset_db():
    """
    Réinitialise complètement la base de données
    Utilisation: flask reset-db
    """
    if input('⚠️  Êtes-vous sûr de vouloir réinitialiser la base de données? (yes/no): ').lower() == 'yes':
        db.drop_all()
        print('✓ Tables supprimées')
        db.create_all()
        print('✓ Tables recréées')
        print('🎉 Base de données réinitialisée avec succès!')
    else:
        print('❌ Opération annulée')


if __name__ == '__main__':
    # Démarrer l'application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print('=' * 60)
    print('🎓 Assistant Intelligent d\'Organisation des Études')
    print('=' * 60)
    print(f'📍 Environnement: {config_name}')
    print(f'🌐 Port: {port}')
    print(f'🔧 Debug: {debug}')
    print('=' * 60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )