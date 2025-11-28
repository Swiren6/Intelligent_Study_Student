import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import API_CONFIG from '../config/api.config';

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  // Fonction générique pour faire des appels API
  const apiCall = useCallback(
    async (endpoint, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
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

        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Une erreur est survenue');
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

  return {
    loading,
    error,
    get,
    post,
    put,
    del,
    patch,
  };
}