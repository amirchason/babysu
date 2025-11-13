/**
 * playerSlice.js
 * Audio player state management
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 1.0,
  queue: [],
  queueIndex: 0,
  repeat: 'off', // 'off', 'one', 'all'
  shuffle: false,
  loading: false,
  error: null
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.position = 0;
      state.loading = false;
      state.error = null;
    },
    play: (state) => {
      state.isPlaying = true;
      state.error = null;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    stop: (state) => {
      state.isPlaying = false;
      state.position = 0;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
      state.queueIndex = 0;
    },
    addToQueue: (state, action) => {
      state.queue.push(action.payload);
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter((_, index) => index !== action.payload);
      if (state.queueIndex >= state.queue.length && state.queue.length > 0) {
        state.queueIndex = state.queue.length - 1;
      }
    },
    clearQueue: (state) => {
      state.queue = [];
      state.queueIndex = 0;
    },
    nextInQueue: (state) => {
      if (state.queue.length > 0) {
        if (state.repeat === 'one') {
          // Stay on current song
          return;
        }
        if (state.queueIndex < state.queue.length - 1) {
          state.queueIndex++;
          state.currentSong = state.queue[state.queueIndex];
          state.position = 0;
        } else if (state.repeat === 'all') {
          state.queueIndex = 0;
          state.currentSong = state.queue[0];
          state.position = 0;
        } else {
          // End of queue
          state.isPlaying = false;
        }
      }
    },
    previousInQueue: (state) => {
      if (state.queue.length > 0) {
        if (state.queueIndex > 0) {
          state.queueIndex--;
          state.currentSong = state.queue[state.queueIndex];
          state.position = 0;
        } else if (state.repeat === 'all') {
          state.queueIndex = state.queue.length - 1;
          state.currentSong = state.queue[state.queueIndex];
          state.position = 0;
        }
      }
    },
    setQueueIndex: (state, action) => {
      if (action.payload >= 0 && action.payload < state.queue.length) {
        state.queueIndex = action.payload;
        state.currentSong = state.queue[action.payload];
        state.position = 0;
      }
    },
    toggleRepeat: (state) => {
      const modes = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeat);
      state.repeat = modes[(currentIndex + 1) % modes.length];
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
      // TODO: Implement shuffle logic
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      return initialState;
    }
  }
});

export const {
  setCurrentSong,
  play,
  pause,
  stop,
  setPosition,
  setDuration,
  setVolume,
  setQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  nextInQueue,
  previousInQueue,
  setQueueIndex,
  toggleRepeat,
  toggleShuffle,
  setLoading,
  setError,
  clearError,
  reset
} = playerSlice.actions;

// Selectors
export const selectCurrentSong = (state) => state.player.currentSong;
export const selectIsPlaying = (state) => state.player.isPlaying;
export const selectPosition = (state) => state.player.position;
export const selectDuration = (state) => state.player.duration;
export const selectVolume = (state) => state.player.volume;
export const selectQueue = (state) => state.player.queue;
export const selectQueueIndex = (state) => state.player.queueIndex;
export const selectRepeat = (state) => state.player.repeat;
export const selectShuffle = (state) => state.player.shuffle;
export const selectPlayerLoading = (state) => state.player.loading;
export const selectPlayerError = (state) => state.player.error;

export default playerSlice.reducer;
