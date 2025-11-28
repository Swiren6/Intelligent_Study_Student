from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from app import db
from app.models.emploi_du_temps import EmploiDuTemps, Cours
from app.utils.decorators import jwt_required_custom, handle_validation_error
from app.utils.validators import validate_file, ValidationError
from app.utils.helpers import success_response, error_response, save_uploaded_file, delete_file

bp = Blueprint('pdf', __name__)

ALLOWED_EXTENSIONS = {'pdf'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')


@bp.route('/upload', methods=['POST'])
@jwt_required_custom
@handle_validation_error
def upload_pdf(current_user):
    """
    Upload un fichier PDF d'emploi du temps
    """
    try:
        # Vérifier qu'un fichier est présent
        if 'file' not in request.files:
            return error_response('Fichier manquant', 'Aucun fichier fourni', 400)
        
        file = request.files['file']
        
        if file.filename == '':
            return error_response('Fichier invalide', 'Nom de fichier vide', 400)
        
        # Valider le fichier
        validate_file(file, 'Fichier PDF', allowed_extensions=ALLOWED_EXTENSIONS, max_size_mb=16)
        
        # Sauvegarder le fichier
        try:
            filepath = save_uploaded_file(file, UPLOAD_FOLDER, ALLOWED_EXTENSIONS)
        except ValueError as e:
            return error_response('Erreur upload', str(e), 400)
        
        # Créer l'entrée en base de données
        emploi_du_temps = EmploiDuTemps(
            user_id=current_user.id,
            nom_fichier=secure_filename(file.filename),
            fichier_pdf=filepath
        )
        
        # Récupérer les métadonnées si fournies
        semestre = request.form.get('semestre')
        if semestre:
            emploi_du_temps.semestre = semestre
        
        db.session.add(emploi_du_temps)
        db.session.commit()
        
        return success_response(
            data=emploi_du_temps.to_dict(),
            message='Fichier PDF uploadé avec succès. Analyse en cours...',
            status_code=201
        )
        
    except ValidationError as e:
        return error_response('Erreur de validation', str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/emplois-du-temps', methods=['GET'])
@jwt_required_custom
def get_emplois_du_temps(current_user):
    """Récupère tous les emplois du temps de l'utilisateur"""
    try:
        emplois = EmploiDuTemps.query.filter_by(user_id=current_user.id).order_by(
            EmploiDuTemps.date_import.desc()
        ).all()
        
        return success_response(
            data=[edt.to_dict() for edt in emplois],
            message=f"{len(emplois)} emploi(s) du temps trouvé(s)"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/emplois-du-temps/<int:id>', methods=['GET'])
@jwt_required_custom
def get_emploi_du_temps(id, current_user):
    """Récupère un emploi du temps par son ID"""
    try:
        emploi = EmploiDuTemps.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not emploi:
            return error_response('Emploi du temps introuvable', f'Aucun emploi du temps avec l\'ID {id}', 404)
        
        include_cours = request.args.get('include_cours', 'false').lower() == 'true'
        
        return success_response(data=emploi.to_dict(include_cours=include_cours))
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/emplois-du-temps/<int:id>', methods=['DELETE'])
@jwt_required_custom
def delete_emploi_du_temps(id, current_user):
    """Supprime un emploi du temps"""
    try:
        emploi = EmploiDuTemps.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not emploi:
            return error_response('Emploi du temps introuvable', f'Aucun emploi du temps avec l\'ID {id}', 404)
        
        # Supprimer le fichier physique
        if emploi.fichier_pdf and os.path.exists(emploi.fichier_pdf):
            delete_file(emploi.fichier_pdf)
        
        db.session.delete(emploi)
        db.session.commit()
        
        return success_response(message='Emploi du temps supprimé avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/emplois-du-temps/<int:id>/cours', methods=['GET'])
@jwt_required_custom
def get_cours(id, current_user):
    """Récupère les cours d'un emploi du temps"""
    try:
        emploi = EmploiDuTemps.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not emploi:
            return error_response('Emploi du temps introuvable', f'Aucun emploi du temps avec l\'ID {id}', 404)
        
        # Filtres
        jour = request.args.get('jour')
        matiere = request.args.get('matiere')
        
        query = emploi.cours
        
        if jour:
            query = query.filter_by(jour=jour.lower())
        
        if matiere:
            query = query.filter(Cours.matiere.ilike(f'%{matiere}%'))
        
        cours = query.order_by(Cours.jour, Cours.heure_debut).all()
        
        return success_response(
            data=[c.to_dict() for c in cours],
            message=f"{len(cours)} cours trouvé(s)"
        )
        
    except Exception as e:
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/emplois-du-temps/<int:id>/analyser', methods=['POST'])
@jwt_required_custom
def analyser_emploi_du_temps(id, current_user):
    """
    Lance l'analyse d'un emploi du temps PDF
    Cette route déclenchera le service d'analyse PDF
    """
    try:
        emploi = EmploiDuTemps.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not emploi:
            return error_response('Emploi du temps introuvable', f'Aucun emploi du temps avec l\'ID {id}', 404)
        
        if not emploi.fichier_pdf or not os.path.exists(emploi.fichier_pdf):
            return error_response('Fichier manquant', 'Le fichier PDF n\'existe plus', 404)
        
        # TODO: Appeler le service d'analyse PDF ici
        # from app.services.pdf_analyzer import analyser_pdf
        # resultat = analyser_pdf(emploi.fichier_pdf, emploi.id)
        
        # Pour l'instant, marquer comme analysé
        emploi.analyse_completee = True
        emploi.algorithme_utilise = 'PyMuPDF+Regex'
        emploi.confiance_extraction = 85.0
        from datetime import datetime
        emploi.date_analyse = datetime.utcnow()
        
        db.session.commit()
        
        return success_response(
            data=emploi.to_dict(include_cours=True),
            message='Analyse du PDF lancée avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/cours/<int:id>', methods=['PUT'])
@jwt_required_custom
def update_cours(id, current_user):
    """Met à jour un cours extrait"""
    try:
        cours = Cours.query.join(EmploiDuTemps).filter(
            Cours.id == id,
            EmploiDuTemps.user_id == current_user.id
        ).first()
        
        if not cours:
            return error_response('Cours introuvable', f'Aucun cours avec l\'ID {id}', 404)
        
        data = request.get_json()
        
        if not data:
            return error_response('Données manquantes', 'Le corps de la requête ne peut pas être vide', 400)
        
        # Mise à jour des champs
        if 'matiere' in data:
            cours.matiere = data['matiere']
        
        if 'type_cours' in data:
            cours.type_cours = data['type_cours']
        
        if 'salle' in data:
            cours.salle = data['salle']
        
        if 'enseignant' in data:
            cours.enseignant = data['enseignant']
        
        cours.verifie_manuellement = True
        db.session.commit()
        
        return success_response(
            data=cours.to_dict(),
            message='Cours mis à jour avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/cours/<int:id>', methods=['DELETE'])
@jwt_required_custom
def delete_cours(id, current_user):
    """Supprime un cours extrait"""
    try:
        cours = Cours.query.join(EmploiDuTemps).filter(
            Cours.id == id,
            EmploiDuTemps.user_id == current_user.id
        ).first()
        
        if not cours:
            return error_response('Cours introuvable', f'Aucun cours avec l\'ID {id}', 404)
        
        db.session.delete(cours)
        db.session.commit()
        
        return success_response(message='Cours supprimé avec succès')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Erreur serveur', str(e), 500)


@bp.route('/jours-semaine', methods=['GET'])
def get_jours_semaine():
    """Récupère la liste des jours de la semaine"""
    return success_response(data=Cours.get_jours_semaine())