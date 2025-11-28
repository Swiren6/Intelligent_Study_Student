import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './common/Loader';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated } = useAuth();

  // Attendre le chargement
  if (loading) {
    return <Loader fullScreen />;
  }

  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
 
};