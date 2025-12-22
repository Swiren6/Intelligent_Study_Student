// pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, Edit, Save, 
  X, Camera, Shield, Bell, Globe, Lock, GraduationCap 
} from 'lucide-react';
import '../styles/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    ville: '',
    niveauEtude: '',
    filiere: '',
  });
  const [preferences, setPreferences] = useState({
    notificationsEmail: true,
    notificationsPush: true,
    theme: 'system',
    langue: 'fr',
  });

  useEffect(() => {
    // Simuler le chargement des données utilisateur
    const loadUserData = () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
      
      setFormData({
        nom: storedUser.nom || '',
        prenom: storedUser.prenom || '',
        email: storedUser.email || '',
        telephone: storedUser.telephone || '',
        dateNaissance: storedUser.dateNaissance || '',
        ville: storedUser.ville || '',
        niveauEtude: storedUser.niveauEtude || '',
        filiere: storedUser.filiere || '',
      });

      const storedPrefs = JSON.parse(localStorage.getItem('preferences') || '{}');
      setPreferences({
        notificationsEmail: storedPrefs.notificationsEmail !== false,
        notificationsPush: storedPrefs.notificationsPush !== false,
        theme: storedPrefs.theme || 'system',
        langue: storedPrefs.langue || 'fr',
      });

      setLoading(false);
    };

    setTimeout(loadUserData, 500);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Simuler la sauvegarde
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('preferences', JSON.stringify(preferences));
    
    setUser(updatedUser);
    setIsEditing(false);
    
    // Afficher un message de succès
    alert('Profil mis à jour avec succès!');
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      dateNaissance: user?.dateNaissance || '',
      ville: user?.ville || '',
      niveauEtude: user?.niveauEtude || '',
      filiere: user?.filiere || '',
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      // Logique de suppression du compte
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* En-tête */}
      <div className="profile-header">
        <h1 className="profile-title">Mon Profil</h1>
        <p className="profile-subtitle">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div className="profile-content">
        {/* Section gauche - Informations personnelles */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <User className="section-icon" />
              Informations personnelles
            </h2>
            <button
              className={`action-button ${isEditing ? 'save-button' : 'edit-button'}`}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="button-icon" />
                  Enregistrer
                </>
              ) : (
                <>
                  <Edit className="button-icon" />
                  Modifier
                </>
              )}
            </button>
          </div>

          {/* Avatar */}
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar">
                {user?.prenom?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button className="avatar-change-button">
                <Camera className="avatar-change-icon" />
              </button>
            </div>
            <div className="avatar-info">
              <h3>{user?.prenom} {user?.nom}</h3>
              <p>{user?.role === 'admin' ? 'Administrateur' : 'Étudiant'}</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User className="label-icon" />
                  Prénom
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <User className="label-icon" />
                  Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Mail className="label-icon" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Phone className="label-icon" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar className="label-icon" />
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <MapPin className="label-icon" />
                  Ville
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <GraduationCap className="label-icon" />
                  Niveau d'étude
                </label>
                <select
                  name="niveauEtude"
                  value={formData.niveauEtude}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                >
                  <option value="">Sélectionner</option>
                  <option value="licence">Licence</option>
                  <option value="master">Master</option>
                  <option value="doctorat">Doctorat</option>
                  <option value="ingenieur">Ingénieur</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <GraduationCap className="label-icon" />
                  Filière
                </label>
                <input
                  type="text"
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Informatique, Mathématiques, etc."
                  className="form-input"
                />
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button className="cancel-button" onClick={handleCancel}>
                  <X className="button-icon" />
                  Annuler
                </button>
                <button className="save-button" onClick={handleSave}>
                  <Save className="button-icon" />
                  Enregistrer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section droite - Préférences et sécurité */}
        <div className="preferences-section">
          {/* Préférences */}
          <div className="preferences-card">
            <h2 className="card-title">
              <Bell className="card-icon" />
              Préférences
            </h2>
            
            <div className="preference-item">
              <div className="preference-info">
                <h3>Notifications par email</h3>
                <p>Recevoir des notifications par email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notificationsEmail}
                  onChange={(e) => handlePreferenceChange('notificationsEmail', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Notifications push</h3>
                <p>Recevoir des notifications sur l'application</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notificationsPush}
                  onChange={(e) => handlePreferenceChange('notificationsPush', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Thème</h3>
                <p>Apparence de l'application</p>
              </div>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="theme-select"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="system">Système</option>
              </select>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Langue</h3>
                <p>Langue de l'interface</p>
              </div>
              <select
                value={preferences.langue}
                onChange={(e) => handlePreferenceChange('langue', e.target.value)}
                className="language-select"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          {/* Sécurité */}
          <div className="security-card">
            <h2 className="card-title">
              <Shield className="card-icon" />
              Sécurité
            </h2>
            
            <button className="security-button" onClick={handleChangePassword}>
              <Lock className="button-icon" />
              Changer le mot de passe
            </button>
            
            <div className="security-info">
              <p>Dernière connexion: {new Date().toLocaleDateString('fr-FR')}</p>
              <p>Compte créé le: {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Zone dangereuse */}
          <div className="danger-zone">
            <h2 className="danger-title">
              <X className="danger-icon" />
              Zone dangereuse
            </h2>
            <p className="danger-description">
              Ces actions sont irréversibles. Soyez certain de ce que vous faites.
            </p>
            <button className="delete-button" onClick={handleDeleteAccount}>
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;