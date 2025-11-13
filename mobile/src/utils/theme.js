import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B9D',      // Pink - playful and child-friendly
    secondary: '#FFA07A',    // Light coral
    tertiary: '#98D8C8',     // Mint green
    background: '#FFF9FB',   // Very light pink
    surface: '#FFFFFF',
    accent: '#FFD93D',       // Yellow
    error: '#FF6B6B',
    text: '#2D3436',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#2D3436',
    onSurface: '#2D3436',
    disabled: '#CCCCCC',
    placeholder: '#999999',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontWeight: '700',
    },
  },
  roundness: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

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
