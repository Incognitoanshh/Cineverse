import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default AdminRoute;
