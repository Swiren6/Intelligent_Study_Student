"""
Service d'analyse de PDF pour extraire les emplois du temps
Utilise PyMuPDF (pdfplumber) pour l'extraction de texte et des regex pour la détection de cours
"""

import re
from datetime import datetime, time
from typing import List, Dict, Optional, Tuple
import pdfplumber  


from app import db
from app.models.emploi_du_temps import EmploiDuTemps
from app.models.cours import Cours



class PDFAnalyzer:
    """
    Classe pour analyser les emplois du temps au format PDF
    """
    
    # Patterns regex pour détecter les informations
    JOUR_PATTERN = r'\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b'
    HEURE_PATTERN = r'\b([0-1]?[0-9]|2[0-3])[:h]([0-5][0-9])\b'
    SALLE_PATTERN = r'\b(salle|amphi|labo|lab)\s*[A-Z0-9\-]+\b'
    
    # Mots-clés pour détecter les types de cours
    TYPE_COURS_KEYWORDS = {
        'cours': ['cours', 'CM', 'magistral'],
        'td': ['TD', 'travaux dirigés', 'dirigés'],
        'tp': ['TP', 'travaux pratiques', 'pratiques', 'labo'],
        'examen': ['examen', 'exam', 'contrôle', 'test', 'évaluation']
    }
    
    JOURS_SEMAINE = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    
    def __init__(self, emploi_du_temps: EmploiDuTemps):
        """
        Initialise l'analyseur avec un emploi du temps
        
        Args:
            emploi_du_temps: Instance EmploiDuTemps à analyser
        """
        self.emploi_du_temps = emploi_du_temps
        self.pdf_path = emploi_du_temps.fichier_pdf
        self.texte_brut = ""
        self.cours_extraits = []
    
    def analyser(self) -> Dict:
        """
        Lance l'analyse complète du PDF
        
        Returns:
            Dict avec les résultats de l'analyse
        """
        try:
            # Étape 1 : Extraire le texte du PDF
            self.texte_brut = self._extraire_texte_pdf()
            
            # Étape 2 : Détecter les cours dans le texte
            self.cours_extraits = self._detecter_cours()
            
            # Étape 3 : Sauvegarder les cours en base de données
            cours_sauvegardes = self._sauvegarder_cours()
            
            # Étape 4 : Marquer l'analyse comme complétée
            self.emploi_du_temps.analyse_completee = True
            self.emploi_du_temps.algorithme_utilise = 'regex_pymupdf'
            self.emploi_du_temps.nombre_cours_extraits = len(cours_sauvegardes)
            
            # Calculer la confiance moyenne
            if cours_sauvegardes:
                confiance_moyenne = sum(c.confiance for c in cours_sauvegardes) / len(cours_sauvegardes)
                self.emploi_du_temps.confiance_extraction = int(confiance_moyenne)
            else:
                self.emploi_du_temps.confiance_extraction = 0
            
            db.session.commit()
            
            return {
                'success': True,
                'cours_extraits': len(cours_sauvegardes),
                'confiance_moyenne': self.emploi_du_temps.confiance_extraction,
                'message': f'{len(cours_sauvegardes)} cours extraits avec succès'
            }
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': str(e),
                'message': 'Erreur lors de l\'analyse du PDF'
            }
    
    def _extraire_texte_pdf(self) -> str:
        """
        Extrait le texte brut du PDF
        
        Returns:
            Texte complet du PDF
        """
        texte_complet = ""
        
        try:
            doc = pdfplumber.open(self.pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                texte_complet += page.get_text()
            
            doc.close()
            
            return texte_complet
            
        except Exception as e:
            raise Exception(f"Erreur lors de l'extraction du texte PDF : {str(e)}")
    
    def _detecter_cours(self) -> List[Dict]:
        """
        Détecte les cours dans le texte extrait
        
        Returns:
            Liste de dictionnaires contenant les informations des cours détectés
        """
        cours = []
        lignes = self.texte_brut.split('\n')
        
        # Variables pour stocker le contexte
        jour_courant = None
        
        for i, ligne in enumerate(lignes):
            ligne_lower = ligne.lower().strip()
            
            if not ligne_lower:
                continue
            
            # Détecter le jour
            jour_match = re.search(self.JOUR_PATTERN, ligne_lower)
            if jour_match:
                jour_courant = jour_match.group(1)
            
            # Détecter les heures
            heures_matches = list(re.finditer(self.HEURE_PATTERN, ligne_lower))
            
            if heures_matches and jour_courant:
                # On a trouvé des heures et on connaît le jour
                for match in heures_matches:
                    try:
                        heure_debut = self._parse_heure(match.group(1), match.group(2))
                        
                        # Chercher l'heure de fin (souvent sur la même ligne ou la suivante)
                        heure_fin = None
                        
                        # Chercher dans le reste de la ligne
                        reste_ligne = ligne_lower[match.end():]
                        heure_fin_match = re.search(self.HEURE_PATTERN, reste_ligne)
                        
                        if heure_fin_match:
                            heure_fin = self._parse_heure(heure_fin_match.group(1), heure_fin_match.group(2))
                        else:
                            # Par défaut, ajouter 2 heures (durée typique d'un cours)
                            heure_fin = self._ajouter_heures(heure_debut, 2)
                        
                        # Détecter la matière (généralement le texte principal de la ligne)
                        matiere = self._extraire_matiere(ligne)
                        
                        # Détecter le type de cours
                        type_cours = self._detecter_type_cours(ligne)
                        
                        # Détecter la salle
                        salle = self._extraire_salle(ligne)
                        
                        # Calculer la confiance
                        confiance = self._calculer_confiance(matiere, heure_debut, heure_fin, salle)
                        
                        cours_info = {
                            'jour': jour_courant,
                            'heure_debut': heure_debut,
                            'heure_fin': heure_fin,
                            'matiere': matiere,
                            'type_cours': type_cours,
                            'salle': salle,
                            'texte_brut': ligne.strip(),
                            'confiance': confiance,
                            'recurrent': True  # Par défaut, les cours sont récurrents
                        }
                        
                        cours.append(cours_info)
                        
                    except Exception as e:
                        # Si on ne peut pas parser cette ligne, on continue
                        continue
        
        return cours
    
    def _parse_heure(self, heure_str: str, minute_str: str) -> time:
        """
        Parse une heure à partir de strings
        
        Args:
            heure_str: Heures (ex: "14")
            minute_str: Minutes (ex: "30")
        
        Returns:
            Objet time
        """
        heure = int(heure_str)
        minute = int(minute_str)
        return time(heure, minute)
    
    def _ajouter_heures(self, heure_debut: time, heures: int) -> time:
        """
        Ajoute des heures à une heure donnée
        
        Args:
            heure_debut: Heure de départ
            heures: Nombre d'heures à ajouter
        
        Returns:
            Nouvelle heure
        """
        nouvelle_heure = (heure_debut.hour + heures) % 24
        return time(nouvelle_heure, heure_debut.minute)
    
    def _extraire_matiere(self, ligne: str) -> str:
        """
        Extrait le nom de la matière d'une ligne
        
        Args:
            ligne: Ligne de texte
        
        Returns:
            Nom de la matière
        """
        # Supprimer les heures et les salles
        ligne_clean = re.sub(self.HEURE_PATTERN, '', ligne)
        ligne_clean = re.sub(self.SALLE_PATTERN, '', ligne_clean, flags=re.IGNORECASE)
        
        # Supprimer les mots-clés de type de cours
        for type_keywords in self.TYPE_COURS_KEYWORDS.values():
            for keyword in type_keywords:
                ligne_clean = re.sub(r'\b' + keyword + r'\b', '', ligne_clean, flags=re.IGNORECASE)
        
        # Nettoyer et retourner
        matiere = ligne_clean.strip()
        matiere = re.sub(r'\s+', ' ', matiere)  # Supprimer les espaces multiples
        
        return matiere[:100] if matiere else 'Matière non identifiée'
    
    def _detecter_type_cours(self, ligne: str) -> str:
        """
        Détecte le type de cours (cours/TD/TP/examen)
        
        Args:
            ligne: Ligne de texte
        
        Returns:
            Type de cours
        """
        ligne_lower = ligne.lower()
        
        for type_cours, keywords in self.TYPE_COURS_KEYWORDS.items():
            for keyword in keywords:
                if keyword.lower() in ligne_lower:
                    return type_cours
        
        return 'cours'  # Par défaut
    
    def _extraire_salle(self, ligne: str) -> Optional[str]:
        """
        Extrait le nom de la salle
        
        Args:
            ligne: Ligne de texte
        
        Returns:
            Nom de la salle ou None
        """
        match = re.search(self.SALLE_PATTERN, ligne, re.IGNORECASE)
        if match:
            return match.group(0)
        return None
    
    def _calculer_confiance(self, matiere: str, heure_debut: time, 
                           heure_fin: time, salle: Optional[str]) -> int:
        """
        Calcule un score de confiance pour l'extraction
        
        Args:
            matiere: Nom de la matière
            heure_debut: Heure de début
            heure_fin: Heure de fin
            salle: Salle (peut être None)
        
        Returns:
            Score de confiance (0-100)
        """
        confiance = 50  # Confiance de base
        
        # +20 si on a une matière identifiable
        if matiere and matiere != 'Matière non identifiée' and len(matiere) > 3:
            confiance += 20
        
        # +10 si on a des heures cohérentes
        if heure_fin > heure_debut:
            confiance += 10
        
        # +10 si on a une salle
        if salle:
            confiance += 10
        
        # +10 si les heures sont dans les plages typiques (8h-20h)
        if 8 <= heure_debut.hour <= 20:
            confiance += 10
        
        return min(confiance, 100)
    
    def _sauvegarder_cours(self) -> List[Cours]:
        """
        Sauvegarde les cours extraits en base de données
        
        Returns:
            Liste des cours sauvegardés
        """
        cours_sauvegardes = []
        
        for cours_info in self.cours_extraits:
            cours = Cours(
                emploi_du_temps_id=self.emploi_du_temps.id,
                jour=cours_info['jour'],
                heure_debut=cours_info['heure_debut'],
                heure_fin=cours_info['heure_fin'],
                matiere=cours_info['matiere'],
                type_cours=cours_info['type_cours'],
                salle=cours_info['salle'],
                recurrent=cours_info['recurrent'],
                confiance=cours_info['confiance'],
                texte_brut_extrait=cours_info['texte_brut']
            )
            
            db.session.add(cours)
            cours_sauvegardes.append(cours)
        
        return cours_sauvegardes
    
    @staticmethod
    def detecter_creneaux_libres(emploi_du_temps: EmploiDuTemps, 
                                 heure_min: time = time(8, 0),
                                 heure_max: time = time(20, 0)) -> List[Dict]:
        """
        Détecte les créneaux libres dans l'emploi du temps
        
        Args:
            emploi_du_temps: EmploiDuTemps à analyser
            heure_min: Heure de début de journée
            heure_max: Heure de fin de journée
        
        Returns:
            Liste de créneaux libres par jour
        """
        creneaux_libres = []
        
        for jour in ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']:
            # Récupérer les cours du jour
            cours_jour = Cours.query.filter_by(
                emploi_du_temps_id=emploi_du_temps.id,
                jour=jour
            ).order_by(Cours.heure_debut).all()
            
            if not cours_jour:
                # Toute la journée est libre
                creneaux_libres.append({
                    'jour': jour,
                    'heure_debut': heure_min,
                    'heure_fin': heure_max,
                    'duree_minutes': (heure_max.hour - heure_min.hour) * 60
                })
                continue
            
            # Chercher les trous entre les cours
            heure_courante = heure_min
            
            for cours in cours_jour:
                if cours.heure_debut > heure_courante:
                    # Créneau libre trouvé
                    duree = (cours.heure_debut.hour - heure_courante.hour) * 60
                    duree += cours.heure_debut.minute - heure_courante.minute
                    
                    if duree >= 30:  # Au moins 30 minutes
                        creneaux_libres.append({
                            'jour': jour,
                            'heure_debut': heure_courante,
                            'heure_fin': cours.heure_debut,
                            'duree_minutes': duree
                        })
                
                heure_courante = cours.heure_fin
            
            # Vérifier s'il reste du temps après le dernier cours
            if heure_courante < heure_max:
                duree = (heure_max.hour - heure_courante.hour) * 60
                duree += heure_max.minute - heure_courante.minute
                
                if duree >= 30:
                    creneaux_libres.append({
                        'jour': jour,
                        'heure_debut': heure_courante,
                        'heure_fin': heure_max,
                        'duree_minutes': duree
                    })
        
        return creneaux_libres