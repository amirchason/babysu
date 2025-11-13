import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Grid,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Male,
  Female,
  Wc as OtherGenderIcon,
  Cake,
} from '@mui/icons-material';
import { fetchChildren, deleteChild } from '../../core/state/slices/childrenSlice';
import { colors } from '../../ui/theme';

export default function ChildrenPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: children, loading } = useSelector((state) => state.children);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  const handleAddChild = () => {
    navigate('/children/add');
  };

  const handleEditChild = (childId) => {
    navigate(`/children/edit/${childId}`);
  };

  const handleDeleteClick = (child) => {
    setChildToDelete(child);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteChild(childToDelete.id)).unwrap();
      setSuccess(`${childToDelete.name}'s profile has been deleted.`);
      setDeleteDialogOpen(false);
      setChildToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete child profile');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setChildToDelete(null);
  };

  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'boy':
        return <Male sx={{ color: colors.info, fontSize: 20 }} />;
      case 'girl':
        return <Female sx={{ color: colors.accent, fontSize: 20 }} />;
      case 'other':
        return <OtherGenderIcon sx={{ color: colors.tertiary, fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'boy':
        return colors.info;
      case 'girl':
        return colors.accent;
      case 'other':
        return colors.tertiary;
      default:
        return colors.primary;
    }
  };

  const formatAge = (age) => {
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    return `${age} ${age === 1 ? 'year' : 'years'}`;
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: colors.gradientSecondary,
          py: 4,
          px: 3,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700, mb: 1 }}>
          Your Children
        </Typography>
        <Typography variant="body2" sx={{ color: '#FFF', opacity: 0.9 }}>
          Manage child profiles for personalized songs
        </Typography>
      </Box>

      <Container maxWidth="lg">
        {/* Add Child Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddChild}
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: 25,
            bgcolor: colors.primary,
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: 2,
            '&:hover': {
              bgcolor: '#E55B8A',
              boxShadow: 3,
            },
          }}
        >
          Add New Child
        </Button>

        {/* Empty State */}
        {children.length === 0 && !loading && (
          <Card sx={{ borderRadius: 2, textAlign: 'center', py: 6, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>
                👶
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                No Children Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 4 }}>
                Start by adding your first child's profile to create personalized songs
                tailored just for them!
              </Typography>
              <Button
                variant="outlined"
                onClick={handleAddChild}
                sx={{
                  borderRadius: 25,
                  px: 4,
                  py: 1.5,
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontWeight: 600,
                }}
              >
                Add Your First Child
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Children Grid */}
        {children.length > 0 && (
          <Grid container spacing={3}>
            {children.map((child) => (
              <Grid item xs={12} md={4} key={child.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Avatar and Basic Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: getGenderColor(child.gender),
                          fontSize: 28,
                          fontWeight: 700,
                          mr: 2,
                        }}
                      >
                        {child.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {child.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Cake sx={{ fontSize: 16, color: '#999' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatAge(child.age)} old
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Gender Chip */}
                    {child.gender && (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          icon={getGenderIcon(child.gender)}
                          label={child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: getGenderColor(child.gender) + '20',
                            color: getGenderColor(child.gender),
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEditChild(child.id)}
                        sx={{
                          borderRadius: 25,
                          py: 1,
                          borderColor: colors.primary,
                          color: colors.primary,
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#E55B8A',
                            bgcolor: colors.primary + '10',
                          },
                        }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        onClick={() => handleDeleteClick(child)}
                        sx={{
                          color: colors.error,
                          border: `1px solid ${colors.error}`,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: colors.error + '10',
                          },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Info Card */}
        {children.length > 0 && (
          <Card sx={{ mt: 4, borderRadius: 2, bgcolor: colors.accent + '15', boxShadow: 1 }}>
            <CardContent sx={{ py: 2, px: 3 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                💡 <strong>Tip:</strong> Keep your children's profiles up to date for the best
                personalized song experience. You can edit their age and other details anytime.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Child Profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{childToDelete?.name}'s</strong> profile? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{
              borderRadius: 25,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 25,
              fontWeight: 600,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error/Success Snackbar */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={3000}
        onClose={() => {
          setError('');
          setSuccess('');
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setError('');
            setSuccess('');
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
