"""
Service Flask pour l'Intelligence Artificielle - Génération de Plannings
Route: /api/services/
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app.models.matiere import Matiere
from app.models.planning import Planning
from app.models.session_etude import SessionEtude
from app.models.user import User
from app import db

# Import du service IA
import sys
sys.path.append('/home/claude')
from create_ai_service import PlanningAI

services_bp = Blueprint('services', __name__)
ai_service = PlanningAI()


@services_bp.route('/generate-planning', methods=['POST'])
@jwt_required()
def generate_planning():
    """
    Génère un planning d'études optimisé avec IA
    
    Body:
        {
            "nom": "Planning Janvier 2025",
            "date_debut": "2025-01-06",
            "date_fin": "2025-01-31",
            "matiere_ids": [1, 2, 3],
            "preferences": {
                "duree_session": 120,
                "heure_debut": "09:00",
                "heure_fin": "18:00",
                "jours_semaine": [0, 1, 2, 3, 4]
            }
        }
    
    Returns:
        {
            "planning_id": 1,
            "sessions": [...],
            "statistiques": {...}
        }
    """
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True)
    
    if not data:
        return jsonify({"error": "Données manquantes"}), 400
    
    # Validation
    required_fields = ['nom', 'date_debut', 'date_fin', 'matiere_ids']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Champ requis: {field}"}), 400
    
    try:
        # Récupération des matières
        matiere_ids = data['matiere_ids']
        matieres = Matiere.query.filter(
            Matiere.id.in_(matiere_ids),
            Matiere.user_id == user_id
        ).all()
        
        if not matieres:
            return jsonify({"error": "Aucune matière trouvée"}), 404
        
        # Préparation des données pour l'IA
        matieres_data = [
            {
                'id': m.id,
                'nom': m.nom,
                'coefficient': m.coefficient,
                'priorite': m.priorite,
                'progression': m.progression or 0
            }
            for m in matieres
        ]
        
        # Préférences (avec valeurs par défaut)
        preferences = data.get('preferences', {})
        preferences.setdefault('duree_session', 120)
        preferences.setdefault('heure_debut', '09:00')
        preferences.setdefault('heure_fin', '18:00')
        preferences.setdefault('jours_semaine', [0, 1, 2, 3, 4])
        
        # Conversion des dates
        date_debut = datetime.strptime(data['date_debut'], '%Y-%m-%d')
        date_fin = datetime.strptime(data['date_fin'], '%Y-%m-%d')
        
        # GÉNÉRATION DU PLANNING AVEC IA
        sessions_data = ai_service.generate_planning(
            matieres_data,
            preferences,
            date_debut,
            date_fin
        )
        
        # Création du planning en base
        planning = Planning(
            user_id=user_id,
            nom=data['nom'],
            date_debut=date_debut.date(),
            date_fin=date_fin.date(),
            actif=True
        )
        db.session.add(planning)
        db.session.flush()  # Pour obtenir l'ID
        
        # Création des sessions
        sessions_created = []
        for session_data in sessions_data:
            session = SessionEtude(
                planning_id=planning.id,
                matiere_id=session_data['matiere_id'],
                date=datetime.strptime(session_data['date'], '%Y-%m-%d').date(),
                heure_debut=session_data['heure_debut'],
                heure_fin=session_data['heure_fin'],
                duree=session_data['duree'],
                type=session_data.get('type', 'revision'),
                terminee=False
            )
            db.session.add(session)
            sessions_created.append(session)
        
        db.session.commit()
        
        # Calcul des statistiques
        stats = ai_service.calculate_study_load(
            matieres_data,
            (date_fin - date_debut).days + 1
        )
        
        return jsonify({
            "success": True,
            "message": "Planning généré avec succès",
            "planning": {
                "id": planning.id,
                "nom": planning.nom,
                "date_debut": planning.date_debut.isoformat(),
                "date_fin": planning.date_fin.isoformat(),
                "nb_sessions": len(sessions_created)
            },
            "sessions": [
                {
                    "id": s.id,
                    "matiere_nom": s.matiere.nom,
                    "date": s.date.isoformat(),
                    "heure_debut": s.heure_debut,
                    "heure_fin": s.heure_fin,
                    "duree": s.duree
                }
                for s in sessions_created[:10]  # Premiers 10
            ],
            "statistiques": stats
        }), 201
        
    except ValueError as e:
        return jsonify({"error": f"Erreur de format de date: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la génération: {str(e)}"}), 500


@services_bp.route('/optimize-planning/<int:planning_id>', methods=['POST'])
@jwt_required()
def optimize_planning(planning_id):
    """
    Optimise un planning existant en fonction des nouvelles données
    """
    user_id = get_jwt_identity()
    
    # Vérification du planning
    planning = Planning.query.filter_by(id=planning_id, user_id=user_id).first()
    if not planning:
        return jsonify({"error": "Planning non trouvé"}), 404
    
    try:
        # Récupérer les sessions et matières
        sessions = SessionEtude.query.filter_by(planning_id=planning_id).all()
        matiere_ids = list(set(s.matiere_id for s in sessions))
        matieres = Matiere.query.filter(Matiere.id.in_(matiere_ids)).all()
        
        # Préparer les données
        sessions_data = [
            {
                'id': s.id,
                'matiere_id': s.matiere_id,
                'date': s.date.isoformat(),
                'heure_debut': s.heure_debut,
                'heure_fin': s.heure_fin,
                'duree': s.duree,
                'terminee': s.terminee
            }
            for s in sessions
        ]
        
        matieres_data = [
            {
                'id': m.id,
                'nom': m.nom,
                'coefficient': m.coefficient,
                'priorite': m.priorite,
                'progression': m.progression or 0
            }
            for m in matieres
        ]
        
        # OPTIMISATION AVEC IA
        sessions_optimisees = ai_service.optimize_existing_planning(
            sessions_data,
            matieres_data
        )
        
        return jsonify({
            "success": True,
            "message": "Planning optimisé",
            "sessions": sessions_optimisees
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de l'optimisation: {str(e)}"}), 500


@services_bp.route('/suggest-topics/<int:matiere_id>', methods=['GET'])
@jwt_required()
def suggest_topics(matiere_id):
    """
    Suggère des sujets d'étude pour une matière
    
    Query params:
        niveau: facile|moyen|difficile (défaut: moyen)
    """
    user_id = get_jwt_identity()
    niveau = request.args.get('niveau', 'moyen')
    
    # Vérification de la matière
    matiere = Matiere.query.filter_by(id=matiere_id, user_id=user_id).first()
    if not matiere:
        return jsonify({"error": "Matière non trouvée"}), 404
    
    # Préparation des données
    matiere_data = {
        'id': matiere.id,
        'nom': matiere.nom,
        'coefficient': matiere.coefficient
    }
    
    # SUGGESTIONS AVEC IA
    suggestions = ai_service.suggest_study_topics(matiere_data, niveau)
    
    return jsonify({
        "matiere": matiere.nom,
        "niveau": niveau,
        "suggestions": suggestions
    }), 200


@services_bp.route('/analyze-patterns', methods=['GET'])
@jwt_required()
def analyze_patterns():
    """
    Analyse les patterns d'étude de l'utilisateur
    
    Query params:
        jours: nombre de jours à analyser (défaut: 30)
    """
    user_id = get_jwt_identity()
    jours = int(request.args.get('jours', 30))
    
    try:
        # Récupérer l'historique
        date_limite = datetime.now() - timedelta(days=jours)
        
        sessions = SessionEtude.query.join(Planning).filter(
            Planning.user_id == user_id,
            SessionEtude.date >= date_limite.date()
        ).all()
        
        # Préparer les données
        historique = [
            {
                'date': s.date.isoformat(),
                'heure_debut': s.heure_debut,
                'duree': s.duree,
                'terminee': s.terminee,
                'matiere_id': s.matiere_id
            }
            for s in sessions
        ]
        
        # ANALYSE AVEC IA
        analyse = ai_service.analyze_study_pattern(historique)
        
        return jsonify({
            "periode": f"Derniers {jours} jours",
            "analyse": analyse
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de l'analyse: {str(e)}"}), 500


@services_bp.route('/calculate-workload', methods=['POST'])
@jwt_required()
def calculate_workload():
    """
    Calcule la charge de travail recommandée
    
    Body:
        {
            "matiere_ids": [1, 2, 3],
            "jours_disponibles": 7
        }
    """
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True)
    
    if not data or 'matiere_ids' not in data:
        return jsonify({"error": "Données manquantes"}), 400
    
    try:
        # Récupérer les matières
        matieres = Matiere.query.filter(
            Matiere.id.in_(data['matiere_ids']),
            Matiere.user_id == user_id
        ).all()
        
        if not matieres:
            return jsonify({"error": "Aucune matière trouvée"}), 404
        
        # Préparer les données
        matieres_data = [
            {
                'id': m.id,
                'nom': m.nom,
                'coefficient': m.coefficient,
                'priorite': m.priorite
            }
            for m in matieres
        ]
        
        jours = data.get('jours_disponibles', 7)
        
        # CALCUL AVEC IA
        charge = ai_service.calculate_study_load(matieres_data, jours)
        
        return jsonify({
            "jours": jours,
            "charge": charge
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors du calcul: {str(e)}"}), 500


# Route de santé pour le service IA
@services_bp.route('/ai-status', methods=['GET'])
def ai_status():
    """Vérifier le statut du service IA"""
    return jsonify({
        "status": "operational",
        "service": "Planning AI",
        "version": "1.0",
        "features": [
            "generate_planning",
            "optimize_planning",
            "suggest_topics",
            "analyze_patterns",
            "calculate_workload"
        ]
    }), 200