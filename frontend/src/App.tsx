import { Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './state/AuthContext';

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="register" />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
