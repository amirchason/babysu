import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Snackbar, Checkbox } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser, clearError } from '../store/slices/authSlice';
import { theme, spacing } from '../utils/theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [validationError, setValidationError] = useState('');

  const handleRegister = () => {
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
    dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
  };

  return (
    <LinearGradient colors={[theme.colors.tertiary, theme.colors.primary]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.logo}>🎵</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join BabySu and start creating magical songs!</Text>

          <View style={styles.form}>
            <TextInput
              mode="outlined"
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
              mode="outlined"
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <Checkbox
                status={agreedToTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                color={theme.colors.primary}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor="#FFFFFF"
              textColor={theme.colors.primary}
            >
              Sign Up
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              textColor="#FFFFFF"
              style={styles.loginButton}
            >
              Already have an account? Log in
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error || !!validationError}
        onDismiss={() => {
          dispatch(clearError());
          setValidationError('');
        }}
        duration={3000}
      >
        {error?.message || validationError}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  logo: { fontSize: 60, textAlign: 'center', marginBottom: spacing.md },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.9,
  },
  form: { marginTop: spacing.lg },
  input: { marginBottom: spacing.md, backgroundColor: '#FFFFFF' },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  button: { marginTop: spacing.md, borderRadius: 25 },
  loginButton: { marginTop: spacing.md },
});
