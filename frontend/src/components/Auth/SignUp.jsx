import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Mail, Lock, User, Eye, EyeOff, UserPlus, Sparkles, CheckCircle } from 'lucide-react';
import BackButton from '../common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../../styles/auth.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { signup } = useAuth();
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

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Faible', color: '#ef4444' };
    if (strength <= 3) return { strength: 66, label: 'Moyen', color: '#f59e0b' };
    return { strength: 100, label: 'Fort', color: '#22c55e' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = 'Vous devez accepter les conditions d\'utilisation';
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
      await signup(formData.name, formData.email, formData.password);
      showToast('Compte créé avec succès ! Bienvenue sur Taskora 🎉', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(
        error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
                Commencez votre voyage vers une meilleure organisation ! 🚀
              </h1>
              
              <p className="auth-info-description">
                Rejoignez des milliers d'étudiants qui ont déjà transformé 
                leur façon d'étudier avec Taskora.
              </p>

              <div className="auth-benefits">
                <div className="benefit-item">
                  <CheckCircle size={24} className="benefit-icon" />
                  <div className="benefit-text">
                    <h4>100% Gratuit</h4>
                    <p>Aucune carte bancaire requise</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle size={24} className="benefit-icon" />
                  <div className="benefit-text">
                    <h4>IA Puissante</h4>
                    <p>Analyse automatique de votre emploi du temps</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle size={24} className="benefit-icon" />
                  <div className="benefit-text">
                    <h4>Synchronisation</h4>
                    <p>Accessible partout, sur tous vos appareils</p>
                  </div>
                </div>
              </div>

              <div className="auth-stats-mini">
                <div className="stat-mini">
                  <div className="stat-mini-number">2h+</div>
                  <div className="stat-mini-label">Gagnées par jour</div>
                </div>
                <div className="stat-mini">
                  <div className="stat-mini-number">95%</div>
                  <div className="stat-mini-label">Productivité</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section droite - Formulaire */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <h1>Créer un compte</h1>
                <p>Inscrivez-vous gratuitement en quelques secondes</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name">
                    <User size={18} />
                    Nom complet
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jean Dupont"
                      className={errors.name ? 'input-error' : ''}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>

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
                      autoComplete="new-password"
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
                  {formData.password && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div 
                          className="password-strength-fill"
                          style={{ 
                            width: `${passwordStrength.strength}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        ></div>
                      </div>
                      <span 
                        className="password-strength-label"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <Lock size={18} />
                    Confirmer le mot de passe
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={errors.confirmPassword ? 'input-error' : ''}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="password-toggle"
                      aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Terms */}
                <div className="form-group">
                  <label className="checkbox-label-full">
                    <input 
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                    />
                    <span>
                      J'accepte les{' '}
                      <Link to="/terms" className="inline-link">
                        conditions d'utilisation
                      </Link>
                      {' '}et la{' '}
                      <Link to="/privacy" className="inline-link">
                        politique de confidentialité
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="error-message">{errors.terms}</span>
                  )}
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
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Créer mon compte
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
                  Déjà un compte ?{' '}
                  <Link to="/login" className="auth-link">
                    Connectez-vous
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