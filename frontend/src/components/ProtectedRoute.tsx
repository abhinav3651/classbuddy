import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { state } = useAuth();
  const { isAuthenticated, user, loading } = state;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is authenticated and has the allowed role
  if (isAuthenticated && user && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  // If user is authenticated but doesn't have the allowed role
  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    }
  }

  // If user is not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;