import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Student Routes */}
          <Route 
            element={<ProtectedRoute allowedRoles={['student']} />}
          >
            <Route path="/student-dashboard" element={<StudentDashboard />} />
          </Route>
          
          {/* Protected Teacher Routes */}
          <Route 
            element={<ProtectedRoute allowedRoles={['teacher']} />}
          >
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          </Route>
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;