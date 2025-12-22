import { useState } from 'react';
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
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
      path: '/dashboard/taches',
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
      path: '/dashboard/emploi-temps',
      badge: null,
    },
    {
      name: 'Notifications',
      icon: Bell,
      path: '/dashboard/notifications',
      badge: 5,
    },
    {
      name: 'Statistiques',
      icon: BarChart3,
      path: '/dashboard/stats',
      badge: null,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen
          bg-white dark:bg-gray-900 
          border-r-2 border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 flex flex-col shadow-xl
        `}
      >
        {/* Logo / Brand */}
        <div className="h-20 flex items-center px-6 border-b-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">TF</span>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Student Assistant</p>
            </div>
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="px-4 py-5 border-b-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.nom || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="mt-3 space-y-1 animate-slideDown">
              <Link
                to="/dashboard/profile"
                className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Mon profil</span>
              </Link>
              <Link
                to="/dashboard/settings"
                className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </Link>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl
                    transition-all duration-200 group relative overflow-hidden
                    ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-9 h-9 rounded-lg flex items-center justify-center
                      ${active 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      }
                    `}>
                      <Icon
                        className={`w-5 h-5 ${
                          active
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <div className={`
                      px-2.5 py-1 text-xs font-bold rounded-lg
                      ${active 
                        ? 'bg-white/30 text-white' 
                        : 'bg-red-500 text-white'
                      }
                      animate-pulse
                    `}>
                      {item.badge}
                    </div>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-4 py-4 border-t-2 border-gray-200 dark:border-gray-800">
          <Link
            to="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-sm font-semibold">Paramètres</span>
          </Link>
        </div>
      </aside>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;