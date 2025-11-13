/**
 * downloadSlice.js
 * Download management state with DownloadManager integration
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  downloads: {},
  queue: [],
  active: [],
  completed: [],
  failed: [],
  stats: {
    active: 0,
    queued: 0,
    downloading: 0,
    completed: 0,
    failed: 0,
    total: 0
  }
};

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    addDownload: (state, action) => {
      const download = action.payload;
      state.downloads[download.id] = download;
      state.queue.push(download.id);
    },
    updateDownload: (state, action) => {
      const { id, updates } = action.payload;
      if (state.downloads[id]) {
        state.downloads[id] = { ...state.downloads[id], ...updates };
      }
    },
    updateProgress: (state, action) => {
      const { id, progress } = action.payload;
      if (state.downloads[id]) {
        state.downloads[id].progress = progress;
      }
    },
    setDownloadStatus: (state, action) => {
      const { id, status } = action.payload;
      if (state.downloads[id]) {
        state.downloads[id].status = status;

        // Update lists
        if (status === 'downloading' && !state.active.includes(id)) {
          state.active.push(id);
          state.queue = state.queue.filter(downloadId => downloadId !== id);
        } else if (status === 'completed') {
          state.active = state.active.filter(downloadId => downloadId !== id);
          if (!state.completed.includes(id)) {
            state.completed.push(id);
          }
        } else if (status === 'failed') {
          state.active = state.active.filter(downloadId => downloadId !== id);
          if (!state.failed.includes(id)) {
            state.failed.push(id);
          }
        }
      }
    },
    removeDownload: (state, action) => {
      const id = action.payload;
      delete state.downloads[id];
      state.queue = state.queue.filter(downloadId => downloadId !== id);
      state.active = state.active.filter(downloadId => downloadId !== id);
      state.completed = state.completed.filter(downloadId => downloadId !== id);
      state.failed = state.failed.filter(downloadId => downloadId !== id);
    },
    clearCompleted: (state) => {
      state.completed.forEach(id => {
        delete state.downloads[id];
      });
      state.completed = [];
    },
    clearFailed: (state) => {
      state.failed.forEach(id => {
        delete state.downloads[id];
      });
      state.failed = [];
    },
    updateStats: (state, action) => {
      state.stats = action.payload;
    },
    pauseDownload: (state, action) => {
      const id = action.payload;
      if (state.downloads[id]) {
        state.downloads[id].status = 'paused';
        state.active = state.active.filter(downloadId => downloadId !== id);
      }
    },
    resumeDownload: (state, action) => {
      const id = action.payload;
      if (state.downloads[id]) {
        state.downloads[id].status = 'pending';
        state.queue.push(id);
      }
    },
    cancelDownload: (state, action) => {
      const id = action.payload;
      if (state.downloads[id]) {
        state.downloads[id].status = 'cancelled';
        state.active = state.active.filter(downloadId => downloadId !== id);
        state.queue = state.queue.filter(downloadId => downloadId !== id);
      }
    },
    reset: () => initialState
  }
});

export const {
  addDownload,
  updateDownload,
  updateProgress,
  setDownloadStatus,
  removeDownload,
  clearCompleted,
  clearFailed,
  updateStats,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  reset
} = downloadSlice.actions;

// Selectors
export const selectAllDownloads = (state) => state.download.downloads;
export const selectDownloadQueue = (state) => state.download.queue;
export const selectActiveDownloads = (state) => state.download.active;
export const selectCompletedDownloads = (state) => state.download.completed;
export const selectFailedDownloads = (state) => state.download.failed;
export const selectDownloadStats = (state) => state.download.stats;
export const selectDownloadById = (id) => (state) => state.download.downloads[id];

export default downloadSlice.reducer;
