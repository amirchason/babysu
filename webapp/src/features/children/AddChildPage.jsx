import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Male,
  Female,
  Wc as OtherGenderIcon,
  Info,
} from '@mui/icons-material';
import { addChild, updateChild } from '../../core/state/slices/childrenSlice';
import { colors } from '../../ui/theme';

export default function AddChildPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { loading, list: children } = useSelector((state) => state.children);

  // Check if editing existing child
  const editingChild = children.find(c => c.id === id);
  const isEditing = !!editingChild;

  const [name, setName] = useState(editingChild?.name || '');
  const [age, setAge] = useState(editingChild?.age?.toString() || '');
  const [gender, setGender] = useState(editingChild?.gender || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editingChild) {
      setName(editingChild.name);
      setAge(editingChild.age.toString());
      setGender(editingChild.gender || '');
    }
  }, [editingChild]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError("Please enter your child's name");
      return;
    }

    const parsedAge = parseFloat(age);
    if (!age || isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 18) {
      setError('Please enter a valid age (0.1 to 18)');
      return;
    }

    try {
      if (isEditing) {
        // Update existing child
        await dispatch(updateChild({
          id: editingChild.id,
          data: { name: name.trim(), age: parsedAge, gender: gender || undefined },
        })).unwrap();
        setSuccess(`${name}'s profile has been updated.`);
      } else {
        // Add new child
        await dispatch(addChild({
          name: name.trim(),
          age: parsedAge,
          gender: gender || undefined,
        })).unwrap();
        setSuccess(`${name}'s profile has been created.`);
      }

      // Navigate back after short delay
      setTimeout(() => {
        navigate('/children');
      }, 1500);
    } catch (err) {
      // Handle different error formats from backend
      const errorMessage = err?.error || err?.message || err || 'Failed to save child profile';
      setError(errorMessage);
      console.error('Child save error:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.gradientSecondary,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h1" sx={{ fontSize: 60, mb: 2 }}>
            👶
          </Typography>
          <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700, mb: 1 }}>
            {isEditing ? 'Edit Child Profile' : 'Add New Child'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#FFF', opacity: 0.9 }}>
            {isEditing ? "Update your child's information" : 'Create a profile for personalized songs'}
          </Typography>
        </Box>

        {/* Form Card */}
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Name Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Child's Name *
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g., Emma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Age Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Age (in years) *
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g., 3 or 1.5"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                type="number"
                inputProps={{ step: 0.1, min: 0.1, max: 18 }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
                For babies under 1 year, use decimals (e.g., 0.5 for 6 months)
              </Typography>
            </Box>

            {/* Gender Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Gender (Optional)
              </Typography>
              <ToggleButtonGroup
                value={gender}
                exclusive
                onChange={(e, newGender) => setGender(newGender)}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      bgcolor: colors.primary,
                      color: '#FFF',
                      '&:hover': {
                        bgcolor: colors.primary,
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="boy">
                  <Male sx={{ mr: 1 }} />
                  Boy
                </ToggleButton>
                <ToggleButton value="girl">
                  <Female sx={{ mr: 1 }} />
                  Girl
                </ToggleButton>
                <ToggleButton value="other">
                  <OtherGenderIcon sx={{ mr: 1 }} />
                  Other
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Info Card */}
            <Card sx={{ bgcolor: colors.accent + '15', borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                <Info sx={{ color: colors.accent, mr: 2 }} />
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  We use this information to personalize song lyrics and themes specifically for your child.
                </Typography>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/children')}
                sx={{
                  borderRadius: 25,
                  py: 1.5,
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                sx={{
                  borderRadius: 25,
                  py: 1.5,
                  bgcolor: colors.primary,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#E55B8A',
                  },
                }}
              >
                {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Child'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Error/Success Snackbar */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={error ? 3000 : 1500}
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
