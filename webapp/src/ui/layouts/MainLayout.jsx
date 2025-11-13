import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  LibraryMusic as LibraryIcon,
  AddCircle as AddIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { colors } from '../theme';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/library') return 1;
    if (path === '/generate') return 2;
    if (path.startsWith('/children')) return 3;
    if (path === '/settings') return 4;
    return 0;
  };

  const handleNavigationChange = (event, newValue) => {
    const routes = ['/', '/library', '/generate', '/children', '/settings'];
    navigate(routes[newValue]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: colors.gradientPrimary,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🎵 BabySu
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // AppBar height
          pb: '56px', // BottomNav height
          minHeight: '100vh',
          backgroundColor: colors.backgroundLight,
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: `1px solid ${colors.border}`,
        }}
        elevation={3}
      >
        <BottomNavigation
          value={getActiveTab()}
          onChange={handleNavigationChange}
          showLabels
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px',
            },
            '& .Mui-selected': {
              color: colors.primary,
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Library" icon={<LibraryIcon />} />
          <BottomNavigationAction
            label="Create"
            icon={<AddIcon sx={{ fontSize: 32 }} />}
            sx={{
              '& .MuiSvgIcon-root': {
                color: colors.primary,
              },
            }}
          />
          <BottomNavigationAction label="Children" icon={<PeopleIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
