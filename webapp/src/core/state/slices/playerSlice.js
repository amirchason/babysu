import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    currentSong: null,
    isPlaying: false,
    sound: null,
    duration: 0,
    position: 0,
    isLoading: false,
  },
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setSound: (state, action) => {
      state.sound = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    resetPlayer: (state) => {
      state.currentSong = null;
      state.isPlaying = false;
      state.sound = null;
      state.duration = 0;
      state.position = 0;
      state.isLoading = false;
    },
  },
});

export const {
  setCurrentSong,
  setIsPlaying,
  setSound,
  setDuration,
  setPosition,
  setIsLoading,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
