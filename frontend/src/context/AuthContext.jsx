import { createContext, useContext, useState, useEffect } from 'react';

// Créer le contexte
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider du contexte
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      // TODO: Remplacer par votre appel API réel
      // Exemple d'appel API :
      /*
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Identifiants incorrects');
      }

      const data = await response.json();
      */

      // SIMULATION (à remplacer par votre API)
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérification simple pour la démo
      if (email && password.length >= 6) {
        const mockUser = {
          id: '1',
          name: email.split('@')[0],
          email: email,
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        // Sauvegarder dans localStorage
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));

        // Mettre à jour l'état
        setUser(mockUser);
        setIsAuthenticated(true);

        return mockUser;
      } else {
        throw new Error('Identifiants incorrects');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  // Fonction d'inscription
  const signup = async (name, email, password) => {
    try {
      // TODO: Remplacer par votre appel API réel
      // Exemple d'appel API :
      /*
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription');
      }

      const data = await response.json();
      */

      // SIMULATION (à remplacer par votre API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifications simples
      if (!name || name.length < 2) {
        throw new Error('Le nom doit contenir au moins 2 caractères');
      }
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }
      if (!password || password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      const mockUser = {
        id: '1',
        name: name,
        email: email,
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Sauvegarder dans localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Mettre à jour l'état
      setUser(mockUser);
      setIsAuthenticated(true);

      return mockUser;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    try {
      // Supprimer du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Réinitialiser l'état
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Fonction de mise à jour du profil
  const updateUser = (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
    }
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;