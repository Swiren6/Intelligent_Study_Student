import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import API_CONFIG from '../config/api.config';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user || data);
        } else if (response.status === 401) {
          // Token expiré, essayer de rafraîchir
          await refreshToken();
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    
    setLoading(false);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    
    if (!refresh) {
      return false;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refresh}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        
        // Recharger le profil utilisateur
        await checkAuth();
        return true;
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const login = useCallback(async (credentials) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          mot_de_passe: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Stocker les tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Stocker les informations utilisateur
        setUser(data.user);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Erreur de connexion');
      }
    } catch (error) {
      throw new Error(error.message || 'Erreur de connexion');
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: userData.fullName.split(' ').pop(),
          prenom: userData.fullName.split(' ')[0],
          email: userData.email,
          mot_de_passe: userData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user || data);
        return { success: true };
      } else {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }
  }, []);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ancien_mot_de_passe: oldPassword,
          nouveau_mot_de_passe: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      throw new Error(error.message || 'Erreur lors du changement de mot de passe');
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};