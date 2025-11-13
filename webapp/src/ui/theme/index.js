import { createTheme } from '@mui/material/styles';

// BabySu Color Palette
export const colors = {
  primary: '#FF6B9D',      // Playful Pink
  secondary: '#FFB6C1',    // Light Pink
  tertiary: '#FFDEE9',     // Pale Pink
  accent: '#FFA07A',       // Coral
  success: '#98D8C8',      // Mint Green
  warning: '#FFD700',      // Gold
  error: '#FF6B6B',        // Soft Red
  info: '#87CEEB',         // Sky Blue

  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #FFDEE9 0%, #FF6B9D 100%)',
  gradientSecondary: 'linear-gradient(135deg, #FFB6C1 0%, #FF6B9D 100%)',
  gradientTertiary: 'linear-gradient(135deg, #98D8C8 0%, #87CEEB 100%)',

  // Neutrals
  text: '#2D3436',
  textLight: '#636E72',
  background: '#FFFFFF',
  backgroundLight: '#F8F9FA',
  border: '#E1E8ED',
};

// Spacing Scale (8px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Material-UI Theme
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: colors.secondary,
      dark: '#E55B8A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.accent,
      light: '#FFB89D',
      dark: '#E68F67',
      contrastText: '#FFFFFF',
    },
    success: {
      main: colors.success,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: colors.warning,
      contrastText: '#2D3436',
    },
    error: {
      main: colors.error,
      contrastText: '#FFFFFF',
    },
    info: {
      main: colors.info,
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.backgroundLight,
      paper: colors.background,
    },
    text: {
      primary: colors.text,
      secondary: colors.textLight,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          padding: '10px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)',
          },
        },
        contained: {
          background: colors.gradientPrimary,
          color: '#FFFFFF',
          '&:hover': {
            background: colors.gradientSecondary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
