import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  BookOpen,
  CheckSquare,
  Calendar,
  Bell,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  BarChart3,
  UserCircle,
  Cog,
  Shield,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import '../../styles/sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const sidebarRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fermer la sidebar en cliquant à l'extérieur (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Swipe gestures pour mobile
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchEndX.current - touchStartX.current;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && !isOpen && touchStartX.current < 50) {
          // Swipe de gauche à droite pour ouvrir
          setIsOpen(true);
        } else if (swipeDistance < 0 && isOpen) {
          // Swipe de droite à gauche pour fermer
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path) => {
    if (path === '/login') {
      handleLogout();
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const handleToggleCollapse = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsCollapsed(!isCollapsed);
    
    // Réinitialiser l'animation après le délai
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null,
    },
    {
      name: 'Matières',
      icon: BookOpen,
      path: '/dashboard/matieres',
      badge: null,
    },
    {
      name: 'Tâches',
      icon: CheckSquare,
      path: '/dashboard/tasks',
      badge: 3,
    },
    {
      name: 'Planning',
      icon: Calendar,
      path: '/dashboard/planning',
      badge: null,
    },
    {
      name: 'Emploi du temps',
      icon: FileText,
      path: '/dashboard/calendarPage',
      badge: null,
    },
    {
      name: 'Nouvelle Session',
      icon: Bell,
      path: '/dashboard/study-session',
      badge: 5,
    },
    {
      name: 'Statistiques',
      icon: BarChart3,
      path: '/dashboard/statistics',
      badge: null,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => {
          setIsAnimating(true);
          setIsOpen(!isOpen);
          setTimeout(() => setIsAnimating(false), 300);
        }}
        className="sidebar-mobile-button"
      >
        {isOpen ? (
          <X className="sidebar-mobile-icon" />
        ) : (
          <Menu className="sidebar-mobile-icon" />
        )}
      </button>

    

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar-container ${isOpen ? 'sidebar-visible' : 'sidebar-hidden'} ${isCollapsed ? 'collapsed' : ''} ${isHovered && isCollapsed ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transition: isAnimating ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {/* Logo / Brand */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-logo-link" onClick={() => setIsOpen(false)}>
            <div className="sidebar-logo-icon">
              <span className="sidebar-logo-initials">TF</span>
            </div>
            <div className={`sidebar-logo-text-container ${isCollapsed ? 'hidden' : ''}`}>
              <span className="sidebar-logo-text">TaskFlow</span>
              <p className="sidebar-logo-subtitle">Student Assistant</p>
            </div>
            {!isCollapsed && (
              <button 
                className="sidebar-collapse-btn"
                onClick={handleToggleCollapse}
                title="Réduire la sidebar"
              >
                <ChevronLeft className="collapse-icon" />
              </button>
            )}
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="sidebar-profile-section">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="sidebar-profile-button"
          >
            <div className="sidebar-profile-avatar">
              <User className="sidebar-profile-avatar-icon" />
            </div>
            <div className={`sidebar-profile-info ${isCollapsed ? 'hidden' : ''}`}>
              <p className="sidebar-profile-name">
                {user?.nom || 'Utilisateur'} {user?.prenom ? ` ${user.prenom}` : ''}
              </p>
              <p className="sidebar-profile-email">
                {user?.email || 'email@example.com'}
              </p>
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`sidebar-profile-chevron ${isProfileOpen ? 'rotated' : ''}`}
              />
            )}
          </button>

          {/* Profile Dropdown (visible uniquement quand pas collapsed) */}
          {isProfileOpen && !isCollapsed && (
            <div className="sidebar-profile-dropdown">
              <Link
                to="/dashboard/profile"
                className="sidebar-profile-link"
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileOpen(false);
                }}
              >
                <UserCircle className="sidebar-profile-link-icon" />
                <span>Mon profil</span>
              </Link>
              <Link
                to="/dashboard/settings"
                className="sidebar-profile-link"
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileOpen(false);
                }}
              >
                <Settings className="sidebar-profile-link-icon" />
                <span>Paramètres</span>
              </Link>
              <div className="sidebar-profile-divider" />
              <button
                onClick={handleLogout}
                className="sidebar-logout-button"
              >
                <LogOut className="sidebar-logout-icon" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-items">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`sidebar-nav-item ${active ? 'sidebar-nav-item-active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <div className="sidebar-nav-item-content">
                    <div className={`sidebar-nav-item-icon-wrapper ${active ? 'sidebar-nav-item-icon-active' : ''}`}>
                      <Icon
                        className={`sidebar-nav-item-icon ${active ? 'sidebar-nav-item-icon-active' : ''}`}
                      />
                    </div>
                    <span className={`sidebar-nav-item-text ${isCollapsed ? 'hidden' : ''}`}>
                      {item.name}
                    </span>
                  </div>

                  {/* Badge */}
                  {!isCollapsed && item.badge && (
                    <div className={`sidebar-nav-item-badge ${active ? 'sidebar-nav-item-badge-active' : ''}`}>
                      {item.badge}
                    </div>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <div className="sidebar-nav-item-indicator" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Expand Button (visible quand collapsed) */}
        {isCollapsed && (
          <div className="sidebar-expand-area">
            <button
              className="sidebar-expand-btn"
              onClick={handleToggleCollapse}
              title="Étendre la sidebar"
            >
              <ChevronRight className="expand-icon" />
            </button>
          </div>
        )}
      </aside>

      {/* Toggle Button for Desktop */}
      <button
        className={`sidebar-desktop-toggle ${isCollapsed ? 'collapsed' : ''}`}
        onClick={handleToggleCollapse}
        title={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="toggle-icon" />
        ) : (
          <ChevronLeft className="toggle-icon" />
        )}
      </button>
    </>
  );
};

export default Sidebar;