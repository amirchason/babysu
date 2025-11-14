import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../../api/index'; // Using real backend API

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await auth.login(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await auth.register(email, password, name);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await auth.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await auth.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isGuestMode: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    loginAsGuest: (state) => {
      state.isAuthenticated = true;
      state.isGuestMode = true;

      // Generate or retrieve consistent guest user ID
      let guestUserId = localStorage.getItem('guestUserId');
      if (!guestUserId) {
        guestUserId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guestUserId', guestUserId);
      }

      state.user = {
        id: guestUserId,
        name: 'Guest User',
        email: 'guest@babysu.app',
      };
      state.token = 'guest-token-' + Date.now();

      // Store guest session data
      localStorage.setItem('guestMode', 'true');
      localStorage.setItem('guestUser', JSON.stringify(state.user));
      localStorage.setItem('userId', guestUserId); // For API calls
      localStorage.setItem('userToken', state.token); // For API calls
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isGuestMode = false;
      localStorage.removeItem('guestMode');
      localStorage.removeItem('guestUser');
      localStorage.removeItem('guestUserId');
      localStorage.removeItem('userId');
      localStorage.removeItem('userToken');
    });
  },
});

export const { clearError, loginAsGuest } = authSlice.actions;
export default authSlice.reducer;
