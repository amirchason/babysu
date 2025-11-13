import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { colors } from '../../ui/theme';

export default function SplashScreen() {
  console.log('🎬 SPLASH SCREEN RENDERED');

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.gradientPrimary,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: 80, mb: 4 }}>
        🎵
      </Typography>
      <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
        BabySu
      </Typography>
      <Typography variant="h2" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 3, backgroundColor: 'red', padding: '20px' }}>
        ⏳ LOADING APP - YOU ARE SEEING THIS!
      </Typography>
      <CircularProgress
        size={48}
        thickness={4}
        sx={{ color: '#FFFFFF' }}
      />
      <Typography variant="body1" sx={{ color: '#FFFFFF', mt: 2, opacity: 0.9 }}>
        Loading your magical songs...
      </Typography>
    </Box>
  );
}
