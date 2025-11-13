/**
 * authSlice.js
 * Authentication state management (guest mode for mobile)
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  guestMode: true,
  userId: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAsGuest: (state) => {
      state.isAuthenticated = true;
      state.guestMode = true;
      state.userId = `guest-${Date.now()}`;
      console.log('[Auth] Logged in as guest:', state.userId);
    },
    login: (state, action) => {
      state.isAuthenticated = true;
      state.guestMode = false;
      state.user = action.payload.user;
      state.userId = action.payload.user.id;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.guestMode = true;
      state.userId = null;
      console.log('[Auth] Logged out');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  }
});

export const { loginAsGuest, login, logout, updateUser } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectIsGuestMode = (state) => state.auth.guestMode;
export const selectUserId = (state) => state.auth.userId;

export default authSlice.reducer;
