import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GrievanceProvider } from './context/GrievanceContext';
import { useAuth } from './context/AuthContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ComplaintForm from './components/complaints/ComplaintForm';
import ComplaintDetail from './components/complaints/ComplaintDetail';
import AdminDashboard from './components/admin/AdminDashboard';
import DepartmentDashboard from './components/department/DepartmentDashboard';
import Profile from './components/profile/Profile';
import NotFound from './components/common/NotFound';

// Styles
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/new"
        element={
          <ProtectedRoute>
            <ComplaintForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Department Admin Routes */}
      <Route
        path="/department"
        element={
          <ProtectedRoute allowedRoles={['dept_admin', 'super_admin']}>
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <GrievanceProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </Router>
      </GrievanceProvider>
    </AuthProvider>
  );
}

export default App;
