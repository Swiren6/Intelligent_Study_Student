import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import AlertModal from '../common/AlertModal';

import '../../styles/auth.css';

export default function Login() {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Efface l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        showSuccess('Connexion réussie! Redirection...');
        
        // Redirection selon le rôle
        setTimeout(() => {
           navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      setAlertConfig({
        type: 'error',
        title: 'Erreur de connexion',
        message: error.message || 'Email ou mot de passe incorrect. Veuillez réessayer.',
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="auth-page">
      {/* Image à gauche */}
     <motion.div 
  className="auth-image"
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6 }}
>
  <div className="image-content">
    <h3>Bienvenue sur TaskFlow</h3>
    <p>La plateforme de gestion de projet qui booste votre productivité</p>
  </div>
  <img src="/src/assets/team checklist-bro.jpg" alt="TaskFlow" />
</motion.div>

      {/* Formulaire à droite */}
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
        
          <h2 className="auth-title">Content de vous revoir !</h2>
          <p className="auth-subtitle">Connectez-vous pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="email"
            name="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon="📧"
            disabled={loading}
          />

          <Input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon="🔒"
            disabled={loading}
          />

          <div className="auth-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Se souvenir de moi</span>
            </label>
            <Link to="/forgot-password" className="auth-link-small">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button 
            type="submit" 
            label="Se connecter"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
          />
        </form>

        <div className="auth-footer">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/signup" className="auth-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>

      <AlertModal
        show={showAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
} 