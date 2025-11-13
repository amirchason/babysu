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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { registerUser, clearError } from '../../core/state/slices/authSlice';
import { colors } from '../../ui/theme';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleRegister = async () => {
    // Validation
    if (!name.trim()) {
      setValidationError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setValidationError('Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      setValidationError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setValidationError('Please agree to the Terms & Conditions');
      return;
    }

    setValidationError('');
    try {
      await dispatch(registerUser({
        name: name.trim(),
        email: email.trim(),
        password
      })).unwrap();
    } catch (err) {
      // Error handled by Redux
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.gradientSecondary,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
              mb: 1,
              textAlign: 'center',
            }}
          >
            Create Account
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#FFFFFF',
              mb: 3,
              textAlign: 'center',
              opacity: 0.9,
            }}
          >
            Join BabySu and start creating magical songs!
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
              handleRegister();
            }}
          >
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoComplete="name"
              variant="outlined"
              sx={{
                mb: 2,
                bgcolor: '#FFFFFF',
                borderRadius: 1,
              }}
            />

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
              autoComplete="new-password"
              variant="outlined"
              sx={{
                mb: 2,
                bgcolor: '#FFFFFF',
                borderRadius: 1,
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              autoComplete="new-password"
              variant="outlined"
              sx={{
                mb: 2,
                bgcolor: '#FFFFFF',
                borderRadius: 1,
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  sx={{
                    color: '#FFFFFF',
                    '&.Mui-checked': {
                      color: '#FFFFFF',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                  I agree to the{' '}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Terms & Conditions
                  </Box>
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleRegister}
              disabled={loading}
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
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{
                mt: 2,
                color: '#FFFFFF',
                fontWeight: 500,
              }}
            >
              Already have an account? Log in
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error || !!validationError}
        autoHideDuration={3000}
        onClose={() => {
          dispatch(clearError());
          setValidationError('');
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            dispatch(clearError());
            setValidationError('');
          }}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error?.message || validationError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
