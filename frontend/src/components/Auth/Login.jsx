import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import BackButton from '../common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../../styles/auth.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      showToast('Connexion réussie ! Bienvenue 👋', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(
        error.message || 'Identifiants incorrects. Veuillez réessayer.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-page">
      {/* Bouton retour */}
      <BackButton />

      {/* Arrière-plan animé */}
      <div className="auth-background">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      {/* Contenu principal */}
      <div className="auth-container">
        <div className="auth-content">
          {/* Section gauche - Illustration/Info */}
          <div className="auth-info">
            <div className="auth-info-content">
              <div className="auth-logo">
                <Sparkles size={40} />
                <h2>Taskora</h2>
              </div>
              
              <h1 className="auth-info-title">
                Bon retour parmi nous ! 👋
              </h1>
              
              <p className="auth-info-description">
                Connectez-vous pour accéder à votre tableau de bord et 
                continuer à optimiser votre organisation.
              </p>

              <div className="auth-features">
                <div className="auth-feature-item">
                  <div className="feature-icon-small">✓</div>
                  <span>Accès à tous vos cours</span>
                </div>
                <div className="auth-feature-item">
                  <div className="feature-icon-small">✓</div>
                  <span>Créneaux libres détectés</span>
                </div>
                <div className="auth-feature-item">
                  <div className="feature-icon-small">✓</div>
                  <span>Suivi de progression</span>
                </div>
              </div>

              <div className="auth-stats-mini">
                <div className="stat-mini">
                  <div className="stat-mini-number">1000+</div>
                  <div className="stat-mini-label">Étudiants actifs</div>
                </div>
                <div className="stat-mini">
                  <div className="stat-mini-number">95%</div>
                  <div className="stat-mini-label">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section droite - Formulaire */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <h1>Connexion</h1>
                <p>Entrez vos identifiants pour continuer</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={18} />
                    Adresse email
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemple@email.com"
                      className={errors.email ? 'input-error' : ''}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label htmlFor="password">
                    <Lock size={18} />
                    Mot de passe
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={errors.password ? 'input-error' : ''}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="password-toggle"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Options */}
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Se souvenir de moi</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Se connecter
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="divider">
                  <span>ou</span>
                </div>

                {/* Social Login (Optionnel) */}
                <div className="social-login">
                  <button type="button" className="btn-social">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuer avec Google
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="auth-footer">
                <p>
                  Pas encore de compte ?{' '}
                  <Link to="/signup" className="auth-link">
                    Inscrivez-vous gratuitement
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}