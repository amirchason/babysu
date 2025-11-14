import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { songs } from '../../api/index';

// Guest mode localStorage helpers
const SONGS_STORAGE_KEY = 'babysu_songs';
const isGuestMode = () => localStorage.getItem('guestMode') === 'true';

const getLocalSongs = () => {
  try {
    const stored = localStorage.getItem(SONGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalSongs = (songsList) => {
  try {
    localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songsList));
  } catch (err) {
    console.error('Failed to save songs to localStorage:', err);
  }
};

export const generateSong = createAsyncThunk(
  'songs/generate',
  async (songData, { rejectWithValue }) => {
    // Guest mode: create demo song in localStorage
    if (isGuestMode()) {
      const newSong = {
        id: `local_song_${Date.now()}`,
        ...songData,
        status: 'ready',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Demo audio
        lyrics: `🎵 Demo Song: "${songData.topic}"\n\nThis is a demo song in guest mode.\nSign up to generate real AI songs with Suno!\n\nFor: ${songData.childIds?.join(', ') || 'Your child'}\nCategory: ${songData.category}\nStyle: ${songData.style}`,
        duration: 180,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };
      const currentSongs = getLocalSongs();
      const updatedSongs = [newSong, ...currentSongs];
      saveLocalSongs(updatedSongs);
      return newSong;
    }

    // Real user: use backend AI generation
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
    // Guest mode: use localStorage
    if (isGuestMode()) {
      return getLocalSongs();
    }

    // Real user: use backend
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
    // Guest mode: return ready status
    if (isGuestMode()) {
      return { status: 'ready', songId };
    }

    // Real user: check backend status
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
    // Guest mode: use localStorage
    if (isGuestMode()) {
      const currentSongs = getLocalSongs();
      const updatedSongs = currentSongs.map(song =>
        song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
      );
      saveLocalSongs(updatedSongs);
      const updatedSong = updatedSongs.find(s => s.id === songId);
      return updatedSong;
    }

    // Real user: use backend
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
    // Guest mode: use localStorage
    if (isGuestMode()) {
      const currentSongs = getLocalSongs();
      const updatedSongs = currentSongs.filter(song => song.id !== songId);
      saveLocalSongs(updatedSongs);
      return songId;
    }

    // Real user: use backend
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
