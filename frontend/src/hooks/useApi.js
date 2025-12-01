import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import API_CONFIG from '../config/api.config';

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  // Fonction pour rafraîchir le token automatiquement
  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    
    if (!refresh) {
      return null;
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
        return data.access_token;
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  // Fonction générique pour faire des appels API
  const apiCall = useCallback(
    async (endpoint, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        const headers = {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...options.headers,
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Controller pour le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        let response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Si 401, essayer de rafraîchir le token et réessayer
        if (response.status === 401 && !options._retry) {
          const newToken = await refreshToken();
          
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            
            // Réessayer avec le nouveau token
            response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
              ...options,
              headers,
              signal: controller.signal,
              _retry: true, // Éviter les boucles infinies
            });
          }
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Une erreur est survenue');
        }

        return { success: true, data };
      } catch (err) {
        const errorMessage = err.name === 'AbortError' 
          ? 'La requête a expiré. Veuillez réessayer.'
          : err.message || 'Une erreur est survenue';
        
        setError(errorMessage);
        
        if (options.showErrorToast !== false) {
          showError(errorMessage);
        }
        
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  // GET request
  const get = useCallback(
    (endpoint, options = {}) => {
      return apiCall(endpoint, { ...options, method: 'GET' });
    },
    [apiCall]
  );

  // POST request
  const post = useCallback(
    (endpoint, body, options = {}) => {
      return apiCall(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    [apiCall]
  );

  // PUT request
  const put = useCallback(
    (endpoint, body, options = {}) => {
      return apiCall(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    [apiCall]
  );

  // DELETE request
  const del = useCallback(
    (endpoint, options = {}) => {
      return apiCall(endpoint, { ...options, method: 'DELETE' });
    },
    [apiCall]
  );

  // PATCH request
  const patch = useCallback(
    (endpoint, body, options = {}) => {
      return apiCall(endpoint, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    [apiCall]
  );

  // Upload file (pour PDFs)
  const upload = useCallback(
    async (endpoint, file, additionalData = {}, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);
        
        // Ajouter les données supplémentaires
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });

        const headers = {
          'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Erreur lors de l\'upload');
        }

        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Erreur lors de l\'upload';
        setError(errorMessage);
        
        if (options.showErrorToast !== false) {
          showError(errorMessage);
        }
        
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  return {
    loading,
    error,
    get,
    post,
    put,
    del,
    patch,
    upload,
  };
}