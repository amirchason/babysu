import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  MusicNote,
  Logout,
  Info,
  Palette,
  Notifications,
} from '@mui/icons-material';
import { logoutUser } from '../../core/state/slices/authSlice';
import { users } from '../../core/api';
import { colors } from '../../ui/theme';

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: songs } = useSelector((state) => state.songs);

  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoadingUsage(true);
      const data = await users.getUsage();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const completedSongs = songs.filter(s => s.status === 'completed').length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Settings
      </Typography>

      {/* Profile Card */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: colors.primary,
                fontSize: 32,
                fontWeight: 700,
                mr: 2,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Usage Stats */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            Usage Statistics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>
                {completedSongs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Songs Created
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.accent }}>
                {loadingUsage ? '...' : usage?.used || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This Month
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.success }}>
                {loadingUsage ? '...' : usage?.remaining || 20}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Remaining
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Settings Options */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <List>
          <ListItem button>
            <ListItemIcon>
              <Person sx={{ color: colors.primary }} />
            </ListItemIcon>
            <ListItemText
              primary="Account Settings"
              secondary="Manage your profile and preferences"
            />
          </ListItem>

          <Divider />

          <ListItem button>
            <ListItemIcon>
              <Notifications sx={{ color: colors.accent }} />
            </ListItemIcon>
            <ListItemText
              primary="Notifications"
              secondary="Manage notification preferences"
            />
          </ListItem>

          <Divider />

          <ListItem button>
            <ListItemIcon>
              <Palette sx={{ color: colors.tertiary }} />
            </ListItemIcon>
            <ListItemText
              primary="Appearance"
              secondary="Theme and display options"
            />
          </ListItem>

          <Divider />

          <ListItem button>
            <ListItemIcon>
              <Info sx={{ color: colors.info }} />
            </ListItemIcon>
            <ListItemText
              primary="About"
              secondary={`BabySu v${import.meta.env.VITE_APP_VERSION || '1.0.0'}`}
            />
          </ListItem>
        </List>
      </Card>

      {/* Logout Button */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFF5F5' }}>
        <CardContent>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={() => setLogoutDialogOpen(true)}
            sx={{
              py: 1.5,
              borderRadius: 25,
              fontWeight: 600,
            }}
          >
            Log Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Made with ❤️ for parents and their little ones
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          © 2025 BabySu. All rights reserved.
        </Typography>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Log Out</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            color="error"
            variant="contained"
            sx={{ borderRadius: 25 }}
          >
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
