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

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
      const result = await register(formData);

      if (result.success) {
        showSuccess('Inscription réussie! Redirection vers la connexion...');

        setAlertConfig({
          type: 'success',
          title: 'Inscription réussie! 🎉',
          message: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        });
        setShowAlert(true);

        // Efface les champs
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        // Redirection vers login après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setAlertConfig({
        type: 'error',
        title: "Erreur d'inscription",
        message: error.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
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
      {/* Image */}
      <motion.div
        className="auth-image"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="image-content">
       
        </div>
        <img src="/src/assets/team checklist-bro.jpg" alt="TaskFlow" />
      </motion.div>

      {/* Formulaire */}
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
       
          <h2 className="auth-title">Commencez votre aventure !</h2>
          <p className="auth-subtitle">Créez votre compte pour organiser vos projets</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="text"
            name="fullName"
            placeholder="Nom complet"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            icon="👤"
            disabled={loading}
          />

          <Input
            type="email"
            name="email"
            placeholder="Adresse email professionnelle"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon="📧"
            disabled={loading}
          />

          <Input
            type="password"
            name="password"
            placeholder="Créez un mot de passe sécurisé"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon="🔒"
            disabled={loading}
          />

          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon="🔒"
            disabled={loading}
          />

        

          <Button
            type="submit"
            label="Créer mon compte"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            icon="🚀"
          />
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte?{' '}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </p>
          <p className="auth-terms">
            En créant un compte, vous acceptez nos{' '}
            <a href="/terms" className="auth-link">Conditions d'utilisation</a> et notre{' '}
            <a href="/privacy" className="auth-link">Politique de confidentialité</a>
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