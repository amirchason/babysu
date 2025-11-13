import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { loginUser, clearError, loginAsGuest } from '../../core/state/slices/authSlice';
import { colors, spacing } from '../../ui/theme';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err) {
      // Error handled by Redux
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleGuestLogin = () => {
    dispatch(loginAsGuest());
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.gradientPrimary,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
          }}
        >
          {/* Logo */}
          <Typography variant="h1" sx={{ fontSize: 60, mb: 2 }}>
            🎵
          </Typography>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              color: '#FFFFFF',
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Welcome Back!
          </Typography>

          {/* Form */}
          <Box
            component="form"
            sx={{
              width: '100%',
              mt: 2,
            }}
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              autoComplete="email"
              autoCapitalize="none"
              variant="outlined"
              sx={{
                mb: 2,
                bgcolor: '#FFFFFF',
                borderRadius: 1,
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              autoComplete="current-password"
              variant="outlined"
              sx={{
                mb: 3,
                bgcolor: '#FFFFFF',
                borderRadius: 1,
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={loading || !email || !password}
              sx={{
                py: 1.5,
                bgcolor: '#FFFFFF',
                color: colors.primary,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#F5F5F5',
                },
                '&:disabled': {
                  bgcolor: '#E0E0E0',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
              sx={{
                mt: 2,
                color: '#FFFFFF',
                fontWeight: 500,
              }}
            >
              Don't have an account? Sign up
            </Button>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Typography sx={{ px: 2, color: '#FFFFFF', fontSize: '0.875rem' }}>
                OR
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
            </Box>

            {/* Guest Login Button */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGuestLogin}
              sx={{
                py: 1.5,
                color: '#FFFFFF',
                borderColor: '#FFFFFF',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: '#FFFFFF',
                },
              }}
            >
              Continue as Guest
            </Button>

            <Typography
              sx={{
                mt: 2,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem',
              }}
            >
              Guest mode: Try the app without an account. Data will not be saved.
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => dispatch(clearError())}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => dispatch(clearError())}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error?.message || 'Login failed'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
