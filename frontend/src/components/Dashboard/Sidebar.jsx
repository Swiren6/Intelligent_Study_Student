import React from 'react';
import {
  Home,
  BookOpen,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { success } = useToast();

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: BookOpen, label: 'Matières', badge: 7 },
    { icon: CheckSquare, label: 'Tâches', badge: 12 },
    { icon: Calendar, label: 'Planning', badge: 2 },
    { icon: BarChart3, label: 'Statistiques' },
    { icon: Users, label: 'Équipe' },
    { icon: FileText, label: 'Documents' },
  ];

  const secondaryItems = [
    { icon: Settings, label: 'Paramètres' },
    { icon: HelpCircle, label: 'Aide & Support' },
  ];

  const handleLogout = () => {
    logout();
    success('À bientôt ! 👋');
  };

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">StudyPro</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard académique</p>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-all ${
                  item.active 
                    ? 'bg-white dark:bg-gray-800 shadow-sm'
                    : 'group-hover:bg-white dark:group-hover:bg-gray-800'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.active
                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Section secondaire */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {secondaryItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <item.icon className="w-4 h-4" />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.nom?.charAt(0) || 'E'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.nom || 'Étudiant'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email || 'étudiant@example.com'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 group-hover:scale-110 transition-transform">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;