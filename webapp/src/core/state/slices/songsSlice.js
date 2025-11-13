import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { songs } from '../../api/index'; // Using backend API

export const generateSong = createAsyncThunk(
  'songs/generate',
  async (songData, { rejectWithValue }) => {
    try {
      // ALWAYS use real API for song generation (even in guest mode)
      // Guest users will have a unique guest ID stored in localStorage
      const response = await songs.generate(songData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSongs = createAsyncThunk(
  'songs/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // ALWAYS use real API for fetching songs (even in guest mode)
      const response = await songs.getAll(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSongStatus = createAsyncThunk(
  'songs/fetchStatus',
  async (songId, { rejectWithValue }) => {
    try {
      // ALWAYS use real API for status checking (even in guest mode)
      const response = await songs.getStatus(songId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'songs/toggleFavorite',
  async (songId, { rejectWithValue }) => {
    try {
      // ALWAYS use real API (even in guest mode)
      const response = await songs.toggleFavorite(songId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSong = createAsyncThunk(
  'songs/delete',
  async (songId, { rejectWithValue }) => {
    try {
      // ALWAYS use real API (even in guest mode)
      await songs.delete(songId);
      return songId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const songsSlice = createSlice({
  name: 'songs',
  initialState: {
    list: [],
    generating: false,
    loading: false,
    error: null,
    currentlyGenerating: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateSongStatus: (state, action) => {
      const { songId, status, audioUrl, lyrics, duration } = action.payload;
      const index = state.list.findIndex(s => s.id === songId);
      if (index !== -1) {
        state.list[index].status = status;
        if (audioUrl) state.list[index].audioUrl = audioUrl;
        if (lyrics) state.list[index].lyrics = lyrics;
        if (duration) state.list[index].duration = duration;
      }
    },
  },
  extraReducers: (builder) => {
    // Generate song
    builder
      .addCase(generateSong.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateSong.fulfilled, (state, action) => {
        state.generating = false;
        const song = action.payload.data || action.payload;
        state.currentlyGenerating = song;
        // Add to list immediately with pending status
        state.list.unshift({
          ...song,
          status: 'generating',
        });
      })
      .addCase(generateSong.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      });

    // Fetch songs
    builder
      .addCase(fetchSongs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Toggle favorite
    builder
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const song = action.payload.data || action.payload;
        const index = state.list.findIndex(s => s.id === song.id);
        if (index !== -1) {
          state.list[index].isFavorite = song.isFavorite;
        }
      });

    // Delete song
    builder
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearError, updateSongStatus } = songsSlice.actions;
export default songsSlice.reducer;
