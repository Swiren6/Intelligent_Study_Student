import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Bell, Search, CheckCircle, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import '../../styles/navbar.css';
import ThemeToggle from '../UI/ThemeToggle';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Simulation de notifications
    setNotifications([
      { 
        id: 1, 
        message: 'Nouveau devoir de Mathématiques à rendre pour demain', 
        time: '5 min', 
        read: false,
        type: 'assignment'
      },
      { 
        id: 2, 
        message: 'Rappel: Examen de Physique demain à 10h', 
        time: '1h', 
        read: true,
        type: 'reminder'
      },
      { 
        id: 3, 
        message: 'Votre projet a été évalué - Note: 16/20', 
        time: '2h', 
        read: false,
        type: 'grade'
      },
      { 
        id: 4, 
        message: 'Nouveau message de votre professeur', 
        time: '1j', 
        read: true,
        type: 'message'
      }
    ]);

    // Fermer les dropdowns en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type) => {
    const icons = {
      assignment: '📝',
      reminder: '⏰',
      grade: '🎓',
      message: '💬'
    };
    return icons[type] || '🔔';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Section gauche avec toggle sidebar */}
        <div className="navbar-left">
          {/* Bouton pour ouvrir/fermer la sidebar */}
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="icon" />
          </button>

          {/* Logo et Nom */}
          <div className="navbar-brand">
            <div className="logo">
              <span className="logo-icon">📚</span>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Taskora</h1>
              <p className="brand-subtitle">Gestion des études</p>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="search-input"
            />
          </div>
        </div>

        {/* Actions utilisateur */}
        <div className="navbar-actions">
          {/* Notifications */}
          <div className="notification-container" ref={notificationRef}>
            <button 
              className={`icon-button notification-button ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="icon" />
              {unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3 className="notification-title">
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="notification-count">
                        {unreadNotifications}
                      </span>
                    )}
                  </h3>
                </div>
                
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <Bell className="notification-empty-icon" />
                      <p className="notification-empty-text">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                        {!notification.read && (
                          <div className="notification-status"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && unreadNotifications > 0 && (
                  <div className="notification-actions">
                    <button className="mark-all-read" onClick={markAllAsRead}>
                      <CheckCircle className="mark-read-icon" />
                      Tout marquer comme lu
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profil utilisateur */}
          <div className="user-menu" ref={dropdownRef}>
            <button 
              className={`user-button ${showDropdown ? 'active' : ''}`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user.prenom} {user.nom}
                </span>
                <span className="user-role">
                  {user.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-avatar large">
                    {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.prenom} {user.nom}</span>
                    <span className="user-email">{user.email || 'utilisateur@example.com'}</span>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item">
                  <User className="dropdown-icon" />
                  <span>Mon profil</span>
                </button>
                
                <button className="dropdown-item">
                  <Settings className="dropdown-icon" />
                  <span>Paramètres</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut className="dropdown-icon" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer les dropdowns */}
      {(showDropdown || showNotifications) && (
        <div 
          className="dropdown-overlay"
          onClick={() => {
            setShowDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
      <ThemeToggle />
    </nav>
  );
}