import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { songs } from '../../api/index';

export const generateSong = createAsyncThunk(
  'songs/generate',
  async (songData, { rejectWithValue }) => {
    try {
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
    builder
      // Generate song
      .addCase(generateSong.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateSong.fulfilled, (state, action) => {
        state.generating = false;
        state.currentlyGenerating = action.payload;
        // Add to list immediately
        state.list.unshift({
          ...action.payload,
          status: action.payload.status || 'generating',
        });
      })
      .addCase(generateSong.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })

      // Fetch songs
      .addCase(fetchSongs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const song = action.payload;
        const index = state.list.findIndex(s => s.id === song.id);
        if (index !== -1) {
          state.list[index].isFavorite = song.isFavorite;
        }
      })

      // Delete song
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearError, updateSongStatus } = songsSlice.actions;
export default songsSlice.reducer;
