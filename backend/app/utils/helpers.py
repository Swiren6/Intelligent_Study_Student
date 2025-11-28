"""
Fonctions helper utiles pour l'application
"""

import os
import secrets
import hashlib
from datetime import datetime, timedelta, time as datetime_time
from typing import List, Dict, Any
import pytz
from werkzeug.utils import secure_filename


def generate_random_string(length=32):
    """
    Génère une chaîne aléatoire sécurisée
    
    Args:
        length (int): Longueur de la chaîne
        
    Returns:
        str: Chaîne aléatoire
    """
    return secrets.token_urlsafe(length)


def generate_hash(text):
    """
    Génère un hash SHA256 d'un texte
    
    Args:
        text (str): Texte à hasher
        
    Returns:
        str: Hash hexadécimal
    """
    return hashlib.sha256(text.encode()).hexdigest()


def allowed_file(filename, allowed_extensions):
    """
    Vérifie si un fichier a une extension autorisée
    
    Args:
        filename (str): Nom du fichier
        allowed_extensions (set): Extensions autorisées
        
    Returns:
        bool: True si autorisé
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def save_uploaded_file(file, upload_folder, allowed_extensions=None):
    """
    Sauvegarde un fichier uploadé de manière sécurisée
    
    Args:
        file: Fichier Flask (FileStorage)
        upload_folder (str): Dossier de destination
        allowed_extensions (set): Extensions autorisées
        
    Returns:
        str: Chemin du fichier sauvegardé
        
    Raises:
        ValueError: Si le fichier est invalide
    """
    if not file or not file.filename:
        raise ValueError("Fichier invalide")
    
    if allowed_extensions and not allowed_file(file.filename, allowed_extensions):
        raise ValueError(f"Extension non autorisée. Extensions acceptées: {', '.join(allowed_extensions)}")
    
    # Créer le dossier s'il n'existe pas
    os.makedirs(upload_folder, exist_ok=True)
    
    # Générer un nom de fichier sécurisé et unique
    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    unique_filename = f"{name}_{generate_random_string(8)}{ext}"
    
    filepath = os.path.join(upload_folder, unique_filename)
    file.save(filepath)
    
    return filepath


def delete_file(filepath):
    """
    Supprime un fichier de manière sécurisée
    
    Args:
        filepath (str): Chemin du fichier
        
    Returns:
        bool: True si supprimé
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
    except Exception:
        return False


def format_datetime(dt, format_str='%Y-%m-%d %H:%M:%S', timezone='UTC'):
    """
    Formate un datetime
    
    Args:
        dt (datetime): DateTime à formater
        format_str (str): Format de sortie
        timezone (str): Fuseau horaire
        
    Returns:
        str: DateTime formaté
    """
    if not dt:
        return None
    
    if timezone != 'UTC':
        tz = pytz.timezone(timezone)
        dt = dt.astimezone(tz)
    
    return dt.strftime(format_str)


def parse_datetime(date_string, format_str='%Y-%m-%d %H:%M:%S'):
    """
    Parse une chaîne en datetime
    
    Args:
        date_string (str): Chaîne à parser
        format_str (str): Format d'entrée
        
    Returns:
        datetime: DateTime parsé ou None
    """
    try:
        return datetime.strptime(date_string, format_str)
    except (ValueError, TypeError):
        return None


def get_date_range(start_date, end_date):
    """
    Génère une liste de dates entre deux dates
    
    Args:
        start_date (date): Date de début
        end_date (date): Date de fin
        
    Returns:
        list: Liste de dates
    """
    dates = []
    current_date = start_date
    
    while current_date <= end_date:
        dates.append(current_date)
        current_date += timedelta(days=1)
    
    return dates


def get_week_number(date):
    """
    Retourne le numéro de semaine d'une date
    
    Args:
        date (date): Date
        
    Returns:
        int: Numéro de semaine
    """
    return date.isocalendar()[1]


def get_weekday_name(date, lang='fr'):
    """
    Retourne le nom du jour de la semaine
    
    Args:
        date (date): Date
        lang (str): Langue ('fr' ou 'en')
        
    Returns:
        str: Nom du jour
    """
    days_fr = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    days_en = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    weekday = date.weekday()
    
    if lang == 'fr':
        return days_fr[weekday]
    return days_en[weekday]


def time_ago(dt, lang='fr'):
    """
    Retourne le temps écoulé depuis une date de manière lisible
    
    Args:
        dt (datetime): DateTime
        lang (str): Langue
        
    Returns:
        str: Temps écoulé (ex: "il y a 5 minutes")
    """
    if not dt:
        return None
    
    now = datetime.utcnow()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if lang == 'fr':
        if seconds < 60:
            return "à l'instant"
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return f"il y a {minutes} minute{'s' if minutes > 1 else ''}"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"il y a {hours} heure{'s' if hours > 1 else ''}"
        elif seconds < 604800:
            days = int(seconds / 86400)
            return f"il y a {days} jour{'s' if days > 1 else ''}"
        elif seconds < 2592000:
            weeks = int(seconds / 604800)
            return f"il y a {weeks} semaine{'s' if weeks > 1 else ''}"
        elif seconds < 31536000:
            months = int(seconds / 2592000)
            return f"il y a {months} mois"
        else:
            years = int(seconds / 31536000)
            return f"il y a {years} an{'s' if years > 1 else ''}"
    else:  # English
        if seconds < 60:
            return "just now"
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif seconds < 604800:
            days = int(seconds / 86400)
            return f"{days} day{'s' if days > 1 else ''} ago"
        elif seconds < 2592000:
            weeks = int(seconds / 604800)
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        elif seconds < 31536000:
            months = int(seconds / 2592000)
            return f"{months} month{'s' if months > 1 else ''} ago"
        else:
            years = int(seconds / 31536000)
            return f"{years} year{'s' if years > 1 else ''} ago"


def calculate_duration(start_time, end_time):
    """
    Calcule la durée entre deux heures
    
    Args:
        start_time (time): Heure de début
        end_time (time): Heure de fin
        
    Returns:
        int: Durée en minutes
    """
    if not start_time or not end_time:
        return 0
    
    start_dt = datetime.combine(datetime.today(), start_time)
    end_dt = datetime.combine(datetime.today(), end_time)
    
    # Si l'heure de fin est avant l'heure de début, c'est le lendemain
    if end_dt < start_dt:
        end_dt += timedelta(days=1)
    
    duration = end_dt - start_dt
    return int(duration.total_seconds() / 60)


def minutes_to_hours_string(minutes):
    """
    Convertit des minutes en format "Xh Ymin"
    
    Args:
        minutes (int): Nombre de minutes
        
    Returns:
        str: Format lisible
    """
    if not minutes:
        return "0 min"
    
    hours = minutes // 60
    mins = minutes % 60
    
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}min"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{mins}min"


def paginate_list(items, page=1, per_page=20):
    """
    Pagine une liste
    
    Args:
        items (list): Liste à paginer
        page (int): Numéro de page
        per_page (int): Éléments par page
        
    Returns:
        dict: Résultat paginé
    """
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'items': items[start:end],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page,
        'has_next': end < total,
        'has_prev': page > 1
    }


def success_response(data=None, message=None, status_code=200):
    """
    Crée une réponse de succès standardisée
    
    Args:
        data: Données à retourner
        message (str): Message de succès
        status_code (int): Code de statut HTTP
        
    Returns:
        tuple: (response_dict, status_code)
    """
    response = {}
    
    if message:
        response['message'] = message
    
    if data is not None:
        response['data'] = data
    
    return response, status_code


def error_response(error, message, status_code=400, details=None):
    """
    Crée une réponse d'erreur standardisée
    
    Args:
        error (str): Type d'erreur
        message (str): Message d'erreur
        status_code (int): Code de statut HTTP
        details: Détails supplémentaires
        
    Returns:
        tuple: (response_dict, status_code)
    """
    response = {
        'error': error,
        'message': message
    }
    
    if details:
        response['details'] = details
    
    return response, status_code


def sanitize_filename(filename):
    """
    Nettoie un nom de fichier pour le rendre sécurisé
    
    Args:
        filename (str): Nom de fichier
        
    Returns:
        str: Nom de fichier nettoyé
    """
    return secure_filename(filename)


def calculate_percentage(part, total):
    """
    Calcule un pourcentage
    
    Args:
        part (float): Partie
        total (float): Total
        
    Returns:
        float: Pourcentage (0-100)
    """
    if not total or total == 0:
        return 0.0
    
    return round((part / total) * 100, 2)


def group_by_key(items, key):
    """
    Groupe une liste d'objets par une clé
    
    Args:
        items (list): Liste d'objets
        key (str): Clé de groupement
        
    Returns:
        dict: Objets groupés
    """
    grouped = {}
    
    for item in items:
        if isinstance(item, dict):
            key_value = item.get(key)
        else:
            key_value = getattr(item, key, None)
        
        if key_value not in grouped:
            grouped[key_value] = []
        
        grouped[key_value].append(item)
    
    return grouped


def flatten_dict(d, parent_key='', sep='_'):
    """
    Aplatit un dictionnaire imbriqué
    
    Args:
        d (dict): Dictionnaire à aplatir
        parent_key (str): Clé parent
        sep (str): Séparateur
        
    Returns:
        dict: Dictionnaire aplati
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def truncate_string(text, length=100, suffix='...'):
    """
    Tronque une chaîne de caractères
    
    Args:
        text (str): Texte à tronquer
        length (int): Longueur maximale
        suffix (str): Suffixe à ajouter
        
    Returns:
        str: Texte tronqué
    """
    if not text or len(text) <= length:
        return text
    
    return text[:length - len(suffix)] + suffix