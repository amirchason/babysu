/**
 * songsSlice.js
 * Songs state management with database integration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SongRepository from '../../services/database/SongRepository';

// Async thunks
export const fetchSongs = createAsyncThunk(
  'songs/fetchAll',
  async (options = {}) => {
    return await SongRepository.findAll(options);
  }
);

export const fetchSongsByChild = createAsyncThunk(
  'songs/fetchByChild',
  async (childId) => {
    return await SongRepository.findByChildId(childId);
  }
);

export const fetchFavorites = createAsyncThunk(
  'songs/fetchFavorites',
  async () => {
    return await SongRepository.findFavorites();
  }
);

export const fetchDownloaded = createAsyncThunk(
  'songs/fetchDownloaded',
  async () => {
    return await SongRepository.findDownloaded();
  }
);

export const createSong = createAsyncThunk(
  'songs/create',
  async (songData) => {
    return await SongRepository.create(songData);
  }
);

export const updateSong = createAsyncThunk(
  'songs/update',
  async ({ id, updates }) => {
    return await SongRepository.update(id, updates);
  }
);

export const toggleFavorite = createAsyncThunk(
  'songs/toggleFavorite',
  async (id) => {
    return await SongRepository.toggleFavorite(id);
  }
);

export const deleteSong = createAsyncThunk(
  'songs/delete',
  async (id) => {
    await SongRepository.delete(id);
    return id;
  }
);

export const searchSongs = createAsyncThunk(
  'songs/search',
  async (query) => {
    return await SongRepository.search(query);
  }
);

export const getSongStats = createAsyncThunk(
  'songs/getStats',
  async () => {
    return await SongRepository.getStats();
  }
);

export const getMostPlayed = createAsyncThunk(
  'songs/getMostPlayed',
  async (limit = 10) => {
    return await SongRepository.getMostPlayed(limit);
  }
);

export const getRecentlyPlayed = createAsyncThunk(
  'songs/getRecentlyPlayed',
  async (limit = 10) => {
    return await SongRepository.getRecentlyPlayed(limit);
  }
);

const initialState = {
  songs: [],
  favorites: [],
  downloaded: [],
  mostPlayed: [],
  recentlyPlayed: [],
  selectedSong: null,
  loading: false,
  error: null,
  searchResults: [],
  stats: {
    total: 0,
    favorites: 0,
    downloaded: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    totalPlays: 0,
    totalStorage: 0
  }
};

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    selectSong: (state, action) => {
      state.selectedSong = action.payload;
    },
    clearSelectedSong: (state) => {
      state.selectedSong = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateSongInState: (state, action) => {
      const { id, updates } = action.payload;
      const songIndex = state.songs.findIndex(s => s.id === id);
      if (songIndex !== -1) {
        state.songs[songIndex] = { ...state.songs[songIndex], ...updates };
      }
      if (state.selectedSong?.id === id) {
        state.selectedSong = { ...state.selectedSong, ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all songs
      .addCase(fetchSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = action.payload;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch by child
      .addCase(fetchSongsByChild.fulfilled, (state, action) => {
        state.songs = action.payload;
      })
      // Fetch favorites
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      // Fetch downloaded
      .addCase(fetchDownloaded.fulfilled, (state, action) => {
        state.downloaded = action.payload;
      })
      // Create song
      .addCase(createSong.fulfilled, (state, action) => {
        state.songs.unshift(action.payload);
      })
      // Update song
      .addCase(updateSong.fulfilled, (state, action) => {
        const index = state.songs.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.songs[index] = action.payload;
        }
        if (state.selectedSong?.id === action.payload.id) {
          state.selectedSong = action.payload;
        }
      })
      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const index = state.songs.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.songs[index] = action.payload;
        }
        if (state.selectedSong?.id === action.payload.id) {
          state.selectedSong = action.payload;
        }
        // Update favorites list
        if (action.payload.is_favorite) {
          state.favorites.push(action.payload);
        } else {
          state.favorites = state.favorites.filter(s => s.id !== action.payload.id);
        }
      })
      // Delete song
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.songs = state.songs.filter(s => s.id !== action.payload);
        state.favorites = state.favorites.filter(s => s.id !== action.payload);
        state.downloaded = state.downloaded.filter(s => s.id !== action.payload);
        if (state.selectedSong?.id === action.payload) {
          state.selectedSong = null;
        }
      })
      // Search songs
      .addCase(searchSongs.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      // Get stats
      .addCase(getSongStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Get most played
      .addCase(getMostPlayed.fulfilled, (state, action) => {
        state.mostPlayed = action.payload;
      })
      // Get recently played
      .addCase(getRecentlyPlayed.fulfilled, (state, action) => {
        state.recentlyPlayed = action.payload;
      });
  }
});

export const { selectSong, clearSelectedSong, clearSearchResults, updateSongInState } = songsSlice.actions;

// Selectors
export const selectAllSongs = (state) => state.songs.songs;
export const selectFavorites = (state) => state.songs.favorites;
export const selectDownloaded = (state) => state.songs.downloaded;
export const selectMostPlayed = (state) => state.songs.mostPlayed;
export const selectRecentlyPlayed = (state) => state.songs.recentlyPlayed;
export const selectSelectedSong = (state) => state.songs.selectedSong;
export const selectSongsLoading = (state) => state.songs.loading;
export const selectSongsError = (state) => state.songs.error;
export const selectSongsSearchResults = (state) => state.songs.searchResults;
export const selectSongsStats = (state) => state.songs.stats;

export default songsSlice.reducer;
