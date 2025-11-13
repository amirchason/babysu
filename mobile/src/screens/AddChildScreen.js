import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, SegmentedButtons, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addChild, updateChild } from '../store/slices/childrenSlice';
import { theme, spacing, shadows } from '../utils/theme';

export default function AddChildScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.children);

  // Check if editing existing child
  const editingChild = route.params?.child;
  const isEditing = !!editingChild;

  const [name, setName] = useState(editingChild?.name || '');
  const [age, setAge] = useState(editingChild?.age?.toString() || '');
  const [gender, setGender] = useState(editingChild?.gender || '');

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your child\'s name');
      return;
    }

    const parsedAge = parseFloat(age);
    if (!age || isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 18) {
      Alert.alert('Invalid Age', 'Please enter a valid age (0.1 to 18)');
      return;
    }

    try {
      if (isEditing) {
        // Update existing child
        await dispatch(updateChild({
          id: editingChild.id,
          data: { name: name.trim(), age: parsedAge, gender: gender || undefined },
        })).unwrap();
        Alert.alert('Updated!', `${name}'s profile has been updated.`);
      } else {
        // Add new child
        await dispatch(addChild({
          name: name.trim(),
          age: parsedAge,
          gender: gender || undefined,
        })).unwrap();
        Alert.alert('Added!', `${name}'s profile has been created.`);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save child profile');
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.tertiary, theme.colors.secondary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>👶</Text>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Child Profile' : 'Add New Child'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update your child\'s information' : 'Create a profile for personalized songs'}
            </Text>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {/* Name Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Child's Name *</Text>
                <TextInput
                  mode="outlined"
                  placeholder="e.g., Emma"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  style={styles.input}
                  outlineColor={theme.colors.primary}
                  activeOutlineColor={theme.colors.primary}
                />
              </View>

              {/* Age Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Age (in years) *</Text>
                <TextInput
                  mode="outlined"
                  placeholder="e.g., 3 or 1.5"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={theme.colors.primary}
                  activeOutlineColor={theme.colors.primary}
                />
                <Text style={styles.helperText}>
                  For babies under 1 year, use decimals (e.g., 0.5 for 6 months)
                </Text>
              </View>

              {/* Gender Selection */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Gender (Optional)</Text>
                <SegmentedButtons
                  value={gender}
                  onValueChange={setGender}
                  buttons={[
                    {
                      value: 'boy',
                      label: 'Boy',
                      icon: () => <Ionicons name="male" size={20} color={gender === 'boy' ? theme.colors.primary : '#999'} />,
                    },
                    {
                      value: 'girl',
                      label: 'Girl',
                      icon: () => <Ionicons name="female" size={20} color={gender === 'girl' ? theme.colors.primary : '#999'} />,
                    },
                    {
                      value: 'other',
                      label: 'Other',
                      icon: () => <Ionicons name="male-female" size={20} color={gender === 'other' ? theme.colors.primary : '#999'} />,
                    },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              {/* Info Card */}
              <Card style={styles.infoCard}>
                <Card.Content style={styles.infoContent}>
                  <Ionicons name="information-circle" size={24} color={theme.colors.accent} />
                  <Text style={styles.infoText}>
                    We use this information to personalize song lyrics and themes specifically for your child.
                  </Text>
                </Card.Content>
              </Card>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={[styles.button, styles.cancelButton]}
                  textColor={theme.colors.primary}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={loading}
                  disabled={loading}
                  style={[styles.button, styles.saveButton]}
                  buttonColor={theme.colors.primary}
                  icon={isEditing ? 'check' : 'plus'}
                >
                  {isEditing ? 'Update' : 'Add Child'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    borderRadius: 16,
    ...shadows.medium,
  },
  cardContent: {
    padding: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  segmentedButtons: {
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: theme.colors.accent + '15',
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    marginLeft: spacing.md,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: 20,
  },
  cancelButton: {
    marginRight: spacing.sm,
    borderColor: theme.colors.primary,
  },
  saveButton: {
    marginLeft: spacing.sm,
  },
});
