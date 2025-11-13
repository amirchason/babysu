import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import childrenReducer from './slices/childrenSlice';
import songsReducer from './slices/songsSlice';
import playerReducer from './slices/playerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    songs: songsReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serializability checks
        ignoredActions: ['player/setSound'],
        ignoredPaths: ['player.sound'],
      },
    }),
});

export default store;
