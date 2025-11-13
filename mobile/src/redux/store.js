/**
 * store.js
 * Redux store configuration with persistence
 */

import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import authReducer from './slices/authSlice';
import childrenReducer from './slices/childrenSlice';
import songsReducer from './slices/songsSlice';
import playerReducer from './slices/playerSlice';
import downloadReducer from './slices/downloadSlice';
import appReducer from './slices/appSlice';

// Configure store
const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    songs: songsReducer,
    player: playerReducer,
    download: downloadReducer,
    app: appReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['player/setCurrentSong', 'download/updateProgress'],
        // Ignore these paths in the state
        ignoredPaths: ['player.sound', 'download.listeners']
      }
    })
});

// Persist state to AsyncStorage
store.subscribe(async () => {
  try {
    const state = store.getState();

    // Persist only necessary parts
    const persistState = {
      auth: state.auth,
      app: state.app
    };

    await AsyncStorage.setItem('redux_state', JSON.stringify(persistState));
  } catch (error) {
    console.error('[Redux] Failed to persist state:', error);
  }
});

// Load persisted state
export async function loadPersistedState() {
  try {
    const persistedState = await AsyncStorage.getItem('redux_state');
    if (persistedState) {
      return JSON.parse(persistedState);
    }
  } catch (error) {
    console.error('[Redux] Failed to load persisted state:', error);
  }
  return {};
}

export default store;
