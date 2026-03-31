import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Rule 2 — blocks all pages until password is changed on first login
const FirstLoginGuard = ({ children }) => {
  const { isFirstLogin, role } = useAuth();

  if (isFirstLogin && role !== 'admin') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default FirstLoginGuard;