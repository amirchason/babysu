import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import childrenReducer from './slices/childrenSlice';
import songsReducer from './slices/songsSlice';
import playerReducer from './slices/playerSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    songs: songsReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['player.sound'],
      },
    }),
});

export default store;
