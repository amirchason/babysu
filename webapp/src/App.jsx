import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import store from './core/state/store';
import theme from './ui/theme';
import { getCurrentUser, loginUser, loginAsGuest } from './core/state/slices/authSlice';

// Import pages (will create these next)
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import HomePage from './features/home/HomePage';
import ChildrenPage from './features/children/ChildrenPage';
import AddChildPage from './features/children/AddChildPage';
import SongGeneratorPage from './features/songs/SongGeneratorPage';
import LibraryPage from './features/songs/LibraryPage';
import SettingsPage from './features/settings/SettingsPage';
import SplashScreen from './platform/web/SplashScreen';
import MainLayout from './ui/layouts/MainLayout';
import DebugConsole from './components/DebugConsole';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <SplashScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirect if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

// App Router Component
function AppRouter() {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  console.log('🔍 APP STATE:', { loading, isAuthenticated, autoLoginAttempted });

  useEffect(() => {
    console.log('🔄 Starting initAuth...');
    async function initAuth() {
      // Check for guest mode first
      const isGuestMode = localStorage.getItem('guestMode') === 'true';
      if (isGuestMode) {
        const guestUser = localStorage.getItem('guestUser');
        if (guestUser) {
          dispatch(loginAsGuest());
          console.log('✅ Guest mode restored');
          setAutoLoginAttempted(true);
          return;
        }
      }

      // Check for existing token
      const token = localStorage.getItem('userToken');
      if (token) {
        // User already logged in, try to restore session
        try {
          await dispatch(getCurrentUser()).unwrap();
          console.log('✅ Session restored successfully');
          setAutoLoginAttempted(true);
          return;
        } catch (error) {
          console.log('❌ Session restore failed:', error.message);
          // Clear invalid token
          localStorage.removeItem('userToken');
          localStorage.removeItem('userId');
        }
      }

      // Try auto-login with env credentials
      const autoEmail = import.meta.env.VITE_AUTO_LOGIN_EMAIL;
      const autoPassword = import.meta.env.VITE_AUTO_LOGIN_PASSWORD;

      if (autoEmail && autoPassword && autoEmail.trim() && autoPassword.trim()) {
        try {
          await dispatch(loginUser({
            email: autoEmail.trim(),
            password: autoPassword.trim()
          })).unwrap();
          console.log('✅ Auto-login successful');
          setAutoLoginAttempted(true);
          return;
        } catch (error) {
          console.log('❌ Auto-login failed:', error.message);
        }
      }

      // AUTO-ENABLE GUEST MODE on first visit
      console.log('🎭 No auth found, enabling guest mode automatically');
      dispatch(loginAsGuest());
      setAutoLoginAttempted(true);
    }

    initAuth();
  }, [dispatch]);

  if (loading || !autoLoginAttempted) {
    return <SplashScreen />;
  }

  return (
    <>
      <DebugConsole />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="children" element={<ChildrenPage />} />
          <Route path="children/add" element={<AddChildPage />} />
          <Route path="children/edit/:id" element={<AddChildPage />} />
          <Route path="generate" element={<SongGeneratorPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// Main App Component
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter basename="/babysu">
          <AppRouter />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App
