import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MusicNote,
  Favorite,
  AccessTime,
  AddCircle,
  People,
  LibraryMusic,
  ChevronRight,
  Lightbulb,
  HourglassEmpty,
} from '@mui/icons-material';
import { fetchChildren } from '../../core/state/slices/childrenSlice';
import { fetchSongs } from '../../core/state/slices/songsSlice';
import { users } from '../../core/api';
import { colors, spacing } from '../../ui/theme';

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isGuestMode } = useSelector((state) => state.auth);
  const { list: children } = useSelector((state) => state.children);
  const { list: songs } = useSelector((state) => state.songs);

  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(fetchChildren());
    dispatch(fetchSongs({ limit: 5 }));
    loadUsage();
  };

  const loadUsage = async () => {
    try {
      setLoadingUsage(true);
      const response = await users.getUsage();
      setUsage(response.data || response);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentSongs = songs.slice(0, 3);
  const completedSongs = songs.filter(s => s.status === 'completed');

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      {/* Header with Gradient */}
      <Box
        sx={{
          background: colors.gradientPrimary,
          py: 4,
          px: 3,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          mb: 2,
        }}
      >
        <Typography variant="body1" sx={{ color: '#FFFFFF', opacity: 0.9 }}>
          {getGreeting()}!
        </Typography>
        <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700, mt: 0.5 }}>
          {user?.name || 'Parent'}
        </Typography>
        {children.length > 0 && (
          <Typography variant="body2" sx={{ color: '#FFFFFF', opacity: 0.8, mt: 0.5 }}>
            {children.length} {children.length === 1 ? 'child' : 'children'} registered
          </Typography>
        )}
      </Box>

      <Container maxWidth="lg">
        {/* Guest Mode Banner */}
        {isGuestMode && (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Guest Mode:</strong> You're browsing without an account. Data will not be saved.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ ml: 2 }}
              >
                Sign In
              </Button>
            </Box>
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: -4, mb: 3 }}>
          <Grid item xs={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, textAlign: 'center', py: 2 }}>
              <CardContent>
                <MusicNote sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {loadingUsage ? '...' : completedSongs.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Songs Created
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, textAlign: 'center', py: 2 }}>
              <CardContent>
                <Favorite sx={{ fontSize: 40, color: colors.accent, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {songs.filter(s => s.isFavorite).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Favorites
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, textAlign: 'center', py: 2 }}>
              <CardContent>
                <AccessTime sx={{ fontSize: 40, color: colors.tertiary, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {loadingUsage ? '...' : usage?.limit || 20}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monthly Limit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: colors.primary,
                  color: '#FFF',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => navigate('/generate')}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <AddCircle sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Create Song
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: colors.tertiary,
                  color: '#FFF',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => navigate('/children')}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Add Child
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card
                sx={{
                  bgcolor: colors.secondary,
                  color: '#FFF',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => navigate('/library')}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <LibraryMusic sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    My Library
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* No Children State */}
        {children.length === 0 && (
          <Card sx={{ borderRadius: 2, mb: 3, textAlign: 'center', py: 4 }}>
            <CardContent>
              <Typography variant="h1" sx={{ fontSize: 60, mb: 2 }}>
                👶
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Add Your First Child!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 4 }}>
                Start by adding your child's profile to create personalized songs.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/children')}
                sx={{
                  bgcolor: colors.primary,
                  borderRadius: 25,
                  px: 4,
                  py: 1.5,
                }}
              >
                Add Child Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Children Quick View */}
        {children.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Your Children
              </Typography>
              <Button
                onClick={() => navigate('/children')}
                sx={{ color: colors.primary, fontWeight: 600, fontSize: '0.875rem' }}
              >
                See All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {children.map((child) => (
                <Card key={child.id} sx={{ minWidth: 140, borderRadius: 2, boxShadow: 2 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: colors.primary,
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        fontWeight: 700,
                        mx: 'auto',
                        mb: 1,
                      }}
                    >
                      {child.name.charAt(0).toUpperCase()}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {child.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {child.age} years old
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Songs
              </Typography>
              <Button
                onClick={() => navigate('/library')}
                sx={{ color: colors.primary, fontWeight: 600, fontSize: '0.875rem' }}
              >
                See All
              </Button>
            </Box>
            {recentSongs.map((song) => (
              <Card
                key={song.id}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  boxShadow: 1,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 },
                }}
                onClick={() => {/* Navigate to song detail */}}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: colors.backgroundLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    {song.status === 'completed' ? (
                      <MusicNote sx={{ color: colors.primary }} />
                    ) : (
                      <HourglassEmpty sx={{ color: colors.primary }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {song.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {song.category} • {song.status}
                    </Typography>
                  </Box>
                  <ChevronRight sx={{ color: '#999' }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Parenting Tip */}
        <Card sx={{ bgcolor: '#FFF9E6', borderRadius: 2, mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Lightbulb sx={{ color: colors.accent, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                💡 Parenting Tip
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Try creating a bedtime song with your child's favorite things!
              Songs with familiar elements help children feel safe and relaxed.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
