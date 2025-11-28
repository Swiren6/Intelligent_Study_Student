import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Button from "./common/Button";

import '../styles/landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const featuresRef = useRef(null);
  const heroRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      } 
    },
  };

  // Features data
  const features = [
    {
      icon: '📋',
      title: 'Tableaux Intelligents',
      description: 'Créez des tableaux personnalisés avec des automatisations intelligentes pour booster votre productivité.',
      color: '#10B981'
    },
    {
      icon: '⚡',
      title: 'Templates Prédéfinis',
      description: 'Démarrez rapidement avec nos templates optimisés pour différents types de projets et méthodologies.',
      color: '#3B82F6'
    },
    {
      icon: '👥',
      title: 'Collaboration Temps Réel',
      description: 'Travaillez ensemble avec votre équipe en temps réel avec le chat intégré et les notifications intelligentes.',
      color: '#8B5CF6'
    },
    {
      icon: '📊',
      title: 'Analytics Avancés',
      description: 'Suivez vos performances avec des tableaux de bord détaillés et des rapports automatisés.',
      color: '#F59E0B'
    },
    {
      icon: '🤖',
      title: 'IA Intégrée',
      description: 'Optimisez vos workflows avec notre IA qui suggère des améliorations et automatise les tâches répétitives.',
      color: '#EF4444'
    },
    {
      icon: '🔒',
      title: 'Sécurité Entreprise',
      description: 'Protégez vos données avec un chiffrement de bout en bout et des contrôles de sécurité avancés.',
      color: '#06B6D4'
    },
  ];

  // Use cases data
  const useCases = [
    {
      title: 'Gestion de Projet Agile',
      description: 'Planifiez et suivez vos sprints avec des tableaux Kanban optimisés pour les méthodologies Agile.',
      image: '🚀',
      stats: '92% des équipes plus efficaces',
      gradient: 'from-green-500 to-blue-500'
    },
    {
      title: 'Suivi des Tâches',
      description: 'Organisez votre travail quotidien avec des vues personnalisables et des rappels intelligents.',
      image: '✅',
      stats: 'Réduction de 45% des retards',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Roadmap Produit',
      description: 'Visualisez votre stratégie produit avec des timelines interactives et des dépendances intelligentes.',
      image: '🗺️',
      stats: '30% plus de clarté stratégique',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Recrutement',
      description: 'Gérez votre pipeline de recrutement du sourcing à l\'intégration avec des workflows automatisés.',
      image: '💼',
      stats: '60% de gain de temps',
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  // Statistics data
  const stats = [
    { number: '50M+', label: 'Utilisateurs Actifs', icon: '👥', delay: 0 },
    { number: '100+', label: 'Pays', icon: '🌍', delay: 0.2 },
    { number: '1M+', label: 'Équipes', icon: '🚀', delay: 0.4 },
    { number: '95%', label: 'Satisfaction', icon: '⭐', delay: 0.6 },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Head of Product',
      company: 'TechCorp',
      comment: 'TaskFlow a révolutionné notre façon de travailler. L\'IA intégrée nous fait gagner 10h par semaine en automatisation!',
      rating: 5,
      avatar: 'MD',
      image: '👩‍💼'
    },
    {
      name: 'Thomas Martin',
      role: 'CTO',
      company: 'ScaleUp',
      comment: 'La flexibilité des tableaux et les intégrations nous ont permis de réduire nos outils de 60%. Incroyable!',
      rating: 5,
      avatar: 'TM',
      image: '👨‍💻'
    },
    {
      name: 'Sophie Lambert',
      role: 'Directrice de Projet',
      company: 'InnovationLab',
      comment: 'Les analytics nous donnent une visibilité parfaite sur l\'avancement. Notre productivité a augmenté de 40%.',
      rating: 5,
      avatar: 'SL',
      image: '👩‍🎓'
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '0€',
      period: 'pour toujours',
      description: 'Parfait pour les petites équipes',
      features: [
        'Tableaux illimités',
        'Jusqu\'à 10 membres',
        'Stockage 5GB',
        'Fonctions de base',
        'Support communautaire',
        'Templates basiques'
      ],
      cta: 'Commencer Gratuitement',
      popular: false,
      color: '#6B7280',
      featured: false
    },
    {
      name: 'Pro',
      price: '15€',
      period: 'par mois',
      description: 'Pour les équipes en croissance',
      features: [
        'Tout le plan Starter',
        'Membres illimités',
        'Stockage 100GB',
        'Automatisations avancées',
        'Support prioritaire 24/7',
        'Analytics détaillés',
        'Intégrations API'
      ],
      cta: 'Essayer 14 Jours Gratuits',
      popular: true,
      color: '#10B981',
      featured: true
    },
    {
      name: 'Enterprise',
      price: '29€',
      period: 'par mois',
      description: 'Pour les organisations',
      features: [
        'Tout le plan Pro',
        'Sécurité avancée SSO/SAML',
        'Stockage illimité',
        'IA intégrée',
        'Admin dédié',
        'Formation personnalisée',
        'SLA 99.9%'
      ],
      cta: 'Contactez-nous',
      popular: false,
      color: '#3B82F6',
      featured: false
    }
  ];

  const faqItems = [
    {
      question: "Puis-je migrer depuis Trello ou Asana ?",
      answer: "Oui! Nous proposons des outils d'importation automatisés depuis Trello, Asana, Jira et autres plateformes. La migration se fait en quelques clics."
    },
    {
      question: "TaskFlow fonctionne-t-il hors ligne ?",
      answer: "Absolument! TaskFlow fonctionne hors ligne et synchronise automatiquement vos données lorsque vous retrouvez une connexion."
    },
    {
      question: "Quelles intégrations sont disponibles ?",
      answer: "Nous intégrons Slack, Google Drive, GitHub, Figma, Salesforce et 100+ autres outils via notre API ouverte."
    },
    {
      question: "La sécurité des données est-elle garantie ?",
      answer: "Oui, nous utilisons un chiffrement de bout en bout, des sauvegardes automatiques et sommes conformes RGPD et SOC2."
    }
  ];

  return (
    <div className="landing-page">
     
      
      {/* Navigation */}
      <nav className={`landing-nav ${isScrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="container">
          <div className="nav-content">
            <motion.div 
              className="nav-logo"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="logo-wrapper">
                 <span className="logo-icon">⚡</span>
                <span className="logo-text">TaskFlow</span>
              </div>
            </motion.div>

            <div className="nav-links">
              <a href="#features" className="nav-link">
                <span>Fonctionnalités</span>
              </a>
              <a href="#usecases" className="nav-link">
                <span>Solutions</span>
              </a>
              <a href="#pricing" className="nav-link">
                <span>Tarifs</span>
              </a>
              <a href="#testimonials" className="nav-link">
                <span>Témoignages</span>
              </a>
            </div>

            <motion.div 
              className="nav-actions"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                className="nav-btn nav-btn-secondary"
                onClick={() => navigate('/login')}
              >
                Connexion
              </button>
              <button
                className="nav-btn nav-btn-primary"
                onClick={() => navigate('/signUp')}
              >
                Essai Gratuit
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-background">
          <div className="hero-glow glow-1" />
          <div className="hero-glow glow-2" />
          <div className="hero-glow glow-3" />
        </div>
        
        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial="hidden"
              animate="visible"
              variants={slideInLeft}
            >
              <motion.div 
                className="hero-badge"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                🚀 Plateforme n°1 de gestion de projet
              </motion.div>
              
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Donnez vie à vos
                <span className="hero-title-highlight"> idées</span>
              </motion.h1>
              
              <motion.p 
                className="hero-description"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                TaskFlow combine la puissance de l'IA avec une interface intuitive pour transformer 
                votre façon de travailler. Collaborez, automatisez et réussissez ensemble.
              </motion.p>
              
              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <Button
                  label="Commencer Gratuitement"
                  variant="primary"
                  size="xl"
                  onClick={() => navigate('/signup')}
                  icon="🚀"
                  fullWidth={false}
                  className="hero-cta-primary"
                />
                <Button
                  label="Voir la Démo"
                  variant="outline"
                  size="xl"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  fullWidth={false}
                  className="hero-cta-secondary"
                />
              </motion.div>

              <motion.div 
                className="hero-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <div className="stat-item">
                  <div className="stat-value">4.9/5</div>
                  <div className="stat-label">Note moyenne</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <div className="stat-value">10K+</div>
                  <div className="stat-label">Équipes actives</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-visual"
              initial="hidden"
              animate="visible"
              variants={slideInRight}
            >
              <div className="hero-card-stack">
                <div className="card card-1">
                  <div className="card-header">
                    <div className="card-title">Projet Launch</div>
                    <div className="card-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '75%' }} />
                      </div>
                      <span>75%</span>
                    </div>
                  </div>
                  <div className="card-members">
                    <div className="member">👤</div>
                    <div className="member">👤</div>
                    <div className="member">👤</div>
                    <div className="member-count">+5</div>
                  </div>
                </div>
                
                <div className="card card-2">
                  <div className="card-badge">🔥 Trending</div>
                  <div className="card-content">
                    <div className="card-icon">📊</div>
                    <div className="card-text">
                      <div className="card-stats">+42% productivity</div>
                      <div className="card-desc">This week</div>
                    </div>
                  </div>
                </div>
                
                <div className="card card-3">
                  <div className="notification">
                    <div className="notification-icon">🤖</div>
                    <div className="notification-content">
                      <div className="notification-title">AI Suggestion</div>
                      <div className="notification-message">Automate task assignment?</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="floating-elements">
                <div className="floating-element element-1">🚀</div>
                <div className="floating-element element-2">⭐</div>
                <div className="floating-element element-3">💡</div>
                <div className="floating-element element-4">🎯</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="scroll-text">Scroll to explore</div>
          <div className="scroll-arrow">↓</div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" ref={featuresRef}>
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="section-badge">Fonctionnalités</div>
            <h2 className="section-title">Une plateforme conçue pour la performance</h2>
            <p className="section-subtitle">
              Découvrez les outils qui transformeront votre façon de travailler
            </p>
          </motion.div>

          <motion.div
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                variants={fadeInUp}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="feature-card-inner">
                  <div 
                    className="feature-icon-wrapper"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                      borderColor: feature.color
                    }}
                  >
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <div className="feature-arrow">→</div>
                </div>
                <div 
                  className="feature-glow"
                  style={{ backgroundColor: feature.color }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <motion.div
            className="stats-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                variants={scaleIn}
                transition={{ delay: stat.delay }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">{stat.icon}</span>
                </div>
                <motion.h3 
                  className="stat-number"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    delay: stat.delay + 0.2 
                  }}
                >
                  {stat.number}
                </motion.h3>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
{/* Use Cases Section */}
      <section id="usecases" className="use-cases-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Cas d'Usage Populaires</h2>
            <p className="section-subtitle">
              Découvrez comment TaskFlow s'adapte à vos besoins
            </p>
          </motion.div>
          <motion.div
            className="use-cases-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="use-case-card"
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
              >
                <div className="use-case-image">{useCase.image}</div>
                <div className="use-case-content">
                  <h3 className="use-case-title">{useCase.title}</h3>
                  <p className="use-case-description">{useCase.description}</p>
                  <div className="use-case-stats">{useCase.stats}</div>
                  <button className="use-case-link">
                    Découvrir →
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Ils Nous Font Confiance</h2>
            <p className="section-subtitle">
              Des milliers d'équipes utilisent TaskFlow quotidiennement
            </p>
          </motion.div>
          <div className="testimonials-container">
            <motion.div
              className="testimonials-slider"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`testimonial-slide ${index === activeTestimonial ? 'active' : ''}`}
                >
                  <div className="testimonial-card">
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="star">⭐</span>
                      ))}
                    </div>
                    <p className="testimonial-comment">"{testimonial.comment}"</p>
                    <div className="testimonial-author">
                      <div className="author-avatar">{testimonial.avatar}</div>
                      <div className="author-info">
                        <p className="author-name">{testimonial.name}</p>
                        <p className="author-role">{testimonial.role}</p>
                        <p className="author-company">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            <div className="testimonials-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Des Tarifs Simples</h2>
            <p className="section-subtitle">
              Choisissez la formule qui correspond à vos besoins
            </p>
          </motion.div>
          <motion.div
            className="pricing-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`pricing-card ${plan.popular ? 'featured' : ''}`}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                {plan.popular && <div className="pricing-badge">Populaire</div>}
                <div className="pricing-header">
                  <h3 className="pricing-title">{plan.name}</h3>
                  <div className="pricing-price">
                    <span className="price-amount">{plan.price}</span>
                    <span className="price-period">/{plan.period}</span>
                  </div>
                  <p className="pricing-description">{plan.description}</p>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>✅ {feature}</li>
                  ))}
                </ul>
                <Button
                  label={plan.cta}
                  variant={plan.popular ? "primary" : "outline"}
                  size="lg"
                  onClick={() => plan.popular ? navigate('/signup') : navigate('/contact')}
                  fullWidth={true}
                  style={plan.popular ? { backgroundColor: plan.color } : {}}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Questions Fréquentes</h2>
            <p className="section-subtitle">
              Tout ce que vous devez savoir sur TaskFlow
            </p>
          </motion.div>
          <motion.div
            className="faq-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="faq-item" variants={fadeInUp}>
              <h3>Puis-je essayer TaskFlow gratuitement ?</h3>
              <p>Oui ! Notre plan gratuit offre toutes les fonctionnalités de base pour vous permettre de découvrir la plateforme sans limitation de temps.</p>
            </motion.div>
            <motion.div className="faq-item" variants={fadeInUp}>
              <h3>Combien de membres peut-on avoir par équipe ?</h3>
              <p>Le plan gratuit permet jusqu'à 10 membres. Les plans payants offrent des membres illimités pour votre équipe.</p>
            </motion.div>
            <motion.div className="faq-item" variants={fadeInUp}>
              <h3>TaskFlow fonctionne-t-il sur mobile ?</h3>
              <p>Absolument ! TaskFlow est entièrement responsive et fonctionne parfaitement sur tous les appareils mobiles.</p>
            </motion.div>
            <motion.div className="faq-item" variants={fadeInUp}>
              <h3>Puis-je importer mes données depuis Trello ?</h3>
              <p>Oui, nous proposons un outil d'importation simple pour migrer vos tableaux depuis Trello en quelques clics.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="cta-title">Prêt à Organiser Votre Travail?</h2>
            <p className="cta-description">
              Rejoignez des millions d'équipes qui utilisent TaskFlow
              pour accomplir plus ensemble
            </p>
            <div className="cta-actions">
              <Button
                label="Créer un Compte Gratuitement"
                variant="primary"
                size="lg"
                onClick={() => navigate('/signUp')}
                icon="🚀"
                fullWidth={false}
              />
            </div>
            <p className="cta-note">Aucune carte de crédit requise • Essai de 14 jours</p>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-icon">📊</span>
                <span className="logo-text">TaskFlow</span>
              </div>
              <p className="footer-description">
                Votre plateforme de gestion de projet collaborative.
                Organisez, collaborez, accomplissez.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">GitHub</a>
              </div>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Produit</h3>
              <ul className="footer-links">
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#usecases">Cas d'usage</a></li>
                <li><a href="#pricing">Tarifs</a></li>
                <li><a href="/login">Connexion</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Ressources</h3>
              <ul className="footer-links">
                <li><a href="#">Blog</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Tutoriels</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Entreprise</h3>
              <ul className="footer-links">
                <li><a href="#">À propos</a></li>
                <li><a href="#">Carrières</a></li>
                <li><a href="#">Presse</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3 className="footer-title">Contact</h3>
              <ul className="footer-contact">
                <li>📍 Paris, France</li>
                <li>📧 contact@taskflow.fr</li>
                <li>📞 +33 X XX XX XX XX</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 TaskFlow. Tous droits réservés.
            </p>
            <div className="footer-legal">
              <a href="#" className="legal-link">Confidentialité</a>
              <a href="#" className="legal-link">Conditions</a>
              <a href="#" className="legal-link">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}