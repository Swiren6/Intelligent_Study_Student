"""
Validators personnalisés pour la validation des données
"""

import re
from datetime import datetime, date, time
from werkzeug.datastructures import FileStorage


class ValidationError(Exception):
    """Exception personnalisée pour les erreurs de validation"""
    pass


def validate_email(email):
    """
    Valide le format d'un email
    
    Args:
        email (str): Email à valider
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si l'email est invalide
    """
    if not email:
        raise ValidationError("L'email est requis")
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("Format d'email invalide")
    
    return True


def validate_password(password):
    """
    Valide un mot de passe
    - Au moins 8 caractères
    - Au moins une majuscule
    - Au moins une minuscule
    - Au moins un chiffre
    
    Args:
        password (str): Mot de passe à valider
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si le mot de passe est invalide
    """
    if not password:
        raise ValidationError("Le mot de passe est requis")
    
    if len(password) < 8:
        raise ValidationError("Le mot de passe doit contenir au moins 8 caractères")
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Le mot de passe doit contenir au moins une lettre majuscule")
    
    if not re.search(r'[a-z]', password):
        raise ValidationError("Le mot de passe doit contenir au moins une lettre minuscule")
    
    if not re.search(r'\d', password):
        raise ValidationError("Le mot de passe doit contenir au moins un chiffre")
    
    return True


def validate_string(value, field_name, min_length=None, max_length=None, required=True):
    """
    Valide une chaîne de caractères
    
    Args:
        value: Valeur à valider
        field_name (str): Nom du champ
        min_length (int): Longueur minimale
        max_length (int): Longueur maximale
        required (bool): Si le champ est requis
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si la valeur est invalide
    """
    if required and not value:
        raise ValidationError(f"{field_name} est requis")
    
    if value:
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} doit être une chaîne de caractères")
        
        value = value.strip()
        
        if min_length and len(value) < min_length:
            raise ValidationError(f"{field_name} doit contenir au moins {min_length} caractères")
        
        if max_length and len(value) > max_length:
            raise ValidationError(f"{field_name} ne peut pas dépasser {max_length} caractères")
    
    return True


def validate_integer(value, field_name, min_value=None, max_value=None, required=True):
    """
    Valide un entier
    
    Args:
        value: Valeur à valider
        field_name (str): Nom du champ
        min_value (int): Valeur minimale
        max_value (int): Valeur maximale
        required (bool): Si le champ est requis
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si la valeur est invalide
    """
    if required and value is None:
        raise ValidationError(f"{field_name} est requis")
    
    if value is not None:
        if not isinstance(value, int):
            try:
                value = int(value)
            except (ValueError, TypeError):
                raise ValidationError(f"{field_name} doit être un nombre entier")
        
        if min_value is not None and value < min_value:
            raise ValidationError(f"{field_name} doit être supérieur ou égal à {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValidationError(f"{field_name} doit être inférieur ou égal à {max_value}")
    
    return True


def validate_float(value, field_name, min_value=None, max_value=None, required=True):
    """
    Valide un nombre décimal
    
    Args:
        value: Valeur à valider
        field_name (str): Nom du champ
        min_value (float): Valeur minimale
        max_value (float): Valeur maximale
        required (bool): Si le champ est requis
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si la valeur est invalide
    """
    if required and value is None:
        raise ValidationError(f"{field_name} est requis")
    
    if value is not None:
        if not isinstance(value, (int, float)):
            try:
                value = float(value)
            except (ValueError, TypeError):
                raise ValidationError(f"{field_name} doit être un nombre")
        
        if min_value is not None and value < min_value:
            raise ValidationError(f"{field_name} doit être supérieur ou égal à {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValidationError(f"{field_name} doit être inférieur ou égal à {max_value}")
    
    return True


def validate_date(value, field_name, required=True):
    """
    Valide une date
    
    Args:
        value: Valeur à valider (str, date, datetime)
        field_name (str): Nom du champ
        required (bool): Si le champ est requis
        
    Returns:
        date: Date validée
        
    Raises:
        ValidationError: Si la date est invalide
    """
    if required and not value:
        raise ValidationError(f"{field_name} est requis")
    
    if value:
        if isinstance(value, datetime):
            return value.date()
        
        if isinstance(value, date):
            return value
        
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00')).date()
            except ValueError:
                raise ValidationError(f"{field_name} doit être une date valide (format ISO)")
        
        raise ValidationError(f"{field_name} doit être une date valide")
    
    return None


def validate_datetime(value, field_name, required=True):
    """
    Valide une date et heure
    
    Args:
        value: Valeur à valider (str, datetime)
        field_name (str): Nom du champ
        required (bool): Si le champ est requis
        
    Returns:
        datetime: DateTime validé
        
    Raises:
        ValidationError: Si le datetime est invalide
    """
    if required and not value:
        raise ValidationError(f"{field_name} est requis")
    
    if value:
        if isinstance(value, datetime):
            return value
        
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            except ValueError:
                raise ValidationError(f"{field_name} doit être une date/heure valide (format ISO)")
        
        raise ValidationError(f"{field_name} doit être une date/heure valide")
    
    return None


def validate_time(value, field_name, required=True):
    """
    Valide une heure
    
    Args:
        value: Valeur à valider (str, time)
        field_name (str): Nom du champ
        required (bool): Si le champ est requis
        
    Returns:
        time: Time validé
        
    Raises:
        ValidationError: Si l'heure est invalide
    """
    if required and not value:
        raise ValidationError(f"{field_name} est requis")
    
    if value:
        if isinstance(value, time):
            return value
        
        if isinstance(value, str):
            try:
                return datetime.strptime(value, '%H:%M').time()
            except ValueError:
                try:
                    return datetime.strptime(value, '%H:%M:%S').time()
                except ValueError:
                    raise ValidationError(f"{field_name} doit être une heure valide (format HH:MM ou HH:MM:SS)")
        
        raise ValidationError(f"{field_name} doit être une heure valide")
    
    return None


def validate_choice(value, field_name, choices, required=True):
    """
    Valide qu'une valeur fait partie des choix possibles
    
    Args:
        value: Valeur à valider
        field_name (str): Nom du champ
        choices (list): Liste des choix possibles
        required (bool): Si le champ est requis
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si la valeur n'est pas dans les choix
    """
    if required and not value:
        raise ValidationError(f"{field_name} est requis")
    
    if value and value not in choices:
        raise ValidationError(f"{field_name} doit être l'une des valeurs suivantes: {', '.join(map(str, choices))}")
    
    return True


def validate_file(file, field_name, allowed_extensions=None, max_size_mb=None, required=True):
    """
    Valide un fichier uploadé
    
    Args:
        file: Fichier à valider (FileStorage)
        field_name (str): Nom du champ
        allowed_extensions (list): Extensions autorisées (ex: ['pdf', 'jpg'])
        max_size_mb (int): Taille maximale en MB
        required (bool): Si le fichier est requis
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si le fichier est invalide
    """
    if required and not file:
        raise ValidationError(f"{field_name} est requis")
    
    if file:
        if not isinstance(file, FileStorage):
            raise ValidationError(f"{field_name} doit être un fichier valide")
        
        if not file.filename:
            raise ValidationError(f"{field_name} doit avoir un nom de fichier")
        
        # Vérifier l'extension
        if allowed_extensions:
            ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
            if ext not in allowed_extensions:
                raise ValidationError(
                    f"{field_name} doit avoir l'une des extensions suivantes: {', '.join(allowed_extensions)}"
                )
        
        # Vérifier la taille
        if max_size_mb:
            file.seek(0, 2)  # Aller à la fin du fichier
            size_mb = file.tell() / (1024 * 1024)
            file.seek(0)  # Revenir au début
            
            if size_mb > max_size_mb:
                raise ValidationError(f"{field_name} ne peut pas dépasser {max_size_mb}MB")
    
    return True


def validate_url(url, field_name, required=True):
    """
    Valide une URL
    
    Args:
        url (str): URL à valider
        field_name (str): Nom du champ
        required (bool): Si le champ est requis
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si l'URL est invalide
    """
    if required and not url:
        raise ValidationError(f"{field_name} est requis")
    
    if url:
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, url):
            raise ValidationError(f"{field_name} doit être une URL valide")
    
    return True


def validate_hex_color(color, field_name, required=True):
    """
    Valide une couleur hexadécimale
    
    Args:
        color (str): Couleur à valider (ex: #FF5733)
        field_name (str): Nom du champ
        required (bool): Si le champ est requis
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si la couleur est invalide
    """
    if required and not color:
        raise ValidationError(f"{field_name} est requis")
    
    if color:
        pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        if not re.match(pattern, color):
            raise ValidationError(f"{field_name} doit être une couleur hexadécimale valide (ex: #FF5733)")
    
    return True


def validate_json_keys(data, required_keys, optional_keys=None):
    """
    Valide qu'un dictionnaire contient les clés requises
    
    Args:
        data (dict): Dictionnaire à valider
        required_keys (list): Liste des clés requises
        optional_keys (list): Liste des clés optionnelles
        
    Returns:
        bool: True si valide
        
    Raises:
        ValidationError: Si des clés sont manquantes ou invalides
    """
    if not isinstance(data, dict):
        raise ValidationError("Les données doivent être un objet JSON valide")
    
    # Vérifier les clés requises
    missing_keys = [key for key in required_keys if key not in data]
    if missing_keys:
        raise ValidationError(f"Clés manquantes: {', '.join(missing_keys)}")
    
    # Vérifier qu'il n'y a pas de clés inconnues
    if optional_keys is not None:
        all_allowed_keys = set(required_keys + optional_keys)
        unknown_keys = [key for key in data.keys() if key not in all_allowed_keys]
        if unknown_keys:
            raise ValidationError(f"Clés non autorisées: {', '.join(unknown_keys)}")
    
    return True