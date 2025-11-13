import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser, clearError } from '../store/slices/authSlice';
import { theme, spacing } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Text style={styles.logo}>🎵</Text>
        <Text style={styles.title}>Welcome Back!</Text>
        <View style={styles.form}>
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
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#FFFFFF"
            textColor={theme.colors.primary}
          >
            Login
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            textColor="#FFFFFF"
            style={styles.registerButton}
          >
            Don't have an account? Sign up
          </Button>
        </View>
      </KeyboardAvoidingView>
      <Snackbar visible={!!error} onDismiss={() => dispatch(clearError())} duration={3000}>
        {error?.message || 'Login failed'}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  logo: { fontSize: 60, textAlign: 'center', marginBottom: spacing.md },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: spacing.xl },
  form: { marginTop: spacing.lg },
  input: { marginBottom: spacing.md, backgroundColor: '#FFFFFF' },
  button: { marginTop: spacing.md, borderRadius: 25 },
  registerButton: { marginTop: spacing.md },
});
