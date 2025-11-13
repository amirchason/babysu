/**
 * App.js
 * Main application entry point for BabySu mobile app
 * Integrates all services: Database, Storage, Redux, API
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import store from './src/redux/store';

// Services
import Database from './src/services/database';
import Storage from './src/services/storage';
import SongGenerationService from './src/services/api/SongGenerationService';

// Redux actions
import { loginAsGuest } from './src/redux/slices/authSlice';
import { setInitialized } from './src/redux/slices/appSlice';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

function AppInitializer({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('[App] 🚀 Initializing BabySu...');

      // 1. Initialize Database
      console.log('[App] Step 1/5: Initializing database...');
      await Database.initialize();
      console.log('[App] ✅ Database ready');

      // 2. Initialize File Storage
      console.log('[App] Step 2/5: Initializing storage...');
      await Storage.initialize();
      console.log('[App] ✅ Storage ready');

      // 3. Resume song generation polling (if any)
      console.log('[App] Step 3/5: Resuming song generation polling...');
      await SongGenerationService.resumeAllPolling();
      console.log('[App] ✅ Polling resumed');

      // 4. Login as guest (default mode for mobile)
      console.log('[App] Step 4/5: Authenticating...');
      store.dispatch(loginAsGuest());
      console.log('[App] ✅ Logged in as guest');

      // 5. Mark app as initialized
      console.log('[App] Step 5/5: Finalizing...');
      store.dispatch(setInitialized(true));
      console.log('[App] ✅ App initialized');

      console.log('[App] 🎉 BabySu is ready!');
      setIsReady(true);
    } catch (err) {
      console.error('[App] ❌ Initialization failed:', err);
      setError(err.message);
      Alert.alert(
        'Initialization Error',
        `Failed to start app: ${err.message}`,
        [{ text: 'Retry', onPress: () => { setError(null); initializeApp(); } }]
      );
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.errorHint}>Check console for details</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading BabySu...</Text>
        <Text style={styles.loadingHint}>Initializing database and services</Text>
      </View>
    );
  }

  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppInitializer>
        <AppNavigator />
      </AppInitializer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  loadingHint: {
    marginTop: 8,
    fontSize: 14,
    color: '#666'
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16
  },
  errorMessage: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 8
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 16
  }
});
