/**
 * appSlice.js
 * General app state management
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isInitialized: false,
  isOnline: true,
  theme: 'light',
  settings: {
    autoDownload: true,
    downloadQuality: 'high',
    offlineMode: false,
    maxCacheSizeMB: 500,
    autoPlayNext: true,
    notificationsEnabled: true
  },
  navigation: {
    currentTab: 'home',
    currentScreen: null
  },
  ui: {
    showPlayer: false,
    showDownloadProgress: false
  },
  error: null
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    setOnline: (state, action) => {
      state.isOnline = action.payload;
      console.log('[App] Network status:', action.payload ? 'online' : 'offline');
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setSetting: (state, action) => {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    setCurrentTab: (state, action) => {
      state.navigation.currentTab = action.payload;
    },
    setCurrentScreen: (state, action) => {
      state.navigation.currentScreen = action.payload;
    },
    showPlayer: (state) => {
      state.ui.showPlayer = true;
    },
    hidePlayer: (state) => {
      state.ui.showPlayer = false;
    },
    showDownloadProgress: (state) => {
      state.ui.showDownloadProgress = true;
    },
    hideDownloadProgress: (state) => {
      state.ui.showDownloadProgress = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState
  }
});

export const {
  setInitialized,
  setOnline,
  setTheme,
  updateSettings,
  setSetting,
  setCurrentTab,
  setCurrentScreen,
  showPlayer,
  hidePlayer,
  showDownloadProgress,
  hideDownloadProgress,
  setError,
  clearError,
  reset
} = appSlice.actions;

// Selectors
export const selectIsInitialized = (state) => state.app.isInitialized;
export const selectIsOnline = (state) => state.app.isOnline;
export const selectTheme = (state) => state.app.theme;
export const selectSettings = (state) => state.app.settings;
export const selectSetting = (key) => (state) => state.app.settings[key];
export const selectCurrentTab = (state) => state.app.navigation.currentTab;
export const selectCurrentScreen = (state) => state.app.navigation.currentScreen;
export const selectShowPlayer = (state) => state.app.ui.showPlayer;
export const selectShowDownloadProgress = (state) => state.app.ui.showDownloadProgress;
export const selectAppError = (state) => state.app.error;

export default appSlice.reducer;
