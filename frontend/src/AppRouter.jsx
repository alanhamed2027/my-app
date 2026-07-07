import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DevicesPage from './pages/devices/DevicesPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import DepartmentsPage from './pages/departments/DepartmentsPage';
import UsersPage from './pages/users/UsersPage';


import DashboardLayout from './components/layout/DashboardLayout';
import PortalPage from './pages/portal/PortalPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import ActivityLogsPage from './pages/activities/ActivityLogsPage';

/**
 * ProtectedRoute Wrapper
 * If the user is not logged in, redirect them to the Login page.
 * If a requiredRole is specified, check if the user has that role.
 */
const ProtectedRoute = ({ requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    // If the route requires IT_STAFF but the user is VIEWER, redirect to dashboard.
    // ADMIN has access to everything.
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Render the nested route
};

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/portal" replace /> : <LoginPage />} 
      />

      {/* Protected Routes inside Dashboard Layout */}
      <Route element={<ProtectedRoute />}>
        {/* Portal Route (No Layout) */}
        <Route path="/portal" element={<PortalPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          
          {/* Admin and IT_STAFF routes */}
          <Route element={<ProtectedRoute requiredRole="IT_STAFF" />}>
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          
          {/* Admin Only Route */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/activities" element={<ActivityLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
