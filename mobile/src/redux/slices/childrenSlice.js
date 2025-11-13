/**
 * childrenSlice.js
 * Children state management with database integration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ChildRepository from '../../services/database/ChildRepository';

// Async thunks
export const fetchChildren = createAsyncThunk(
  'children/fetchAll',
  async () => {
    return await ChildRepository.findAll();
  }
);

export const createChild = createAsyncThunk(
  'children/create',
  async (childData) => {
    return await ChildRepository.create(childData);
  }
);

export const updateChild = createAsyncThunk(
  'children/update',
  async ({ id, updates }) => {
    return await ChildRepository.update(id, updates);
  }
);

export const deleteChild = createAsyncThunk(
  'children/delete',
  async (id) => {
    await ChildRepository.delete(id);
    return id;
  }
);

export const searchChildren = createAsyncThunk(
  'children/search',
  async (query) => {
    return await ChildRepository.search(query);
  }
);

const initialState = {
  children: [],
  selectedChild: null,
  loading: false,
  error: null,
  searchResults: []
};

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    selectChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    clearSelectedChild: (state) => {
      state.selectedChild = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all children
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.children = action.payload;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create child
      .addCase(createChild.fulfilled, (state, action) => {
        state.children.push(action.payload);
      })
      // Update child
      .addCase(updateChild.fulfilled, (state, action) => {
        const index = state.children.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.children[index] = action.payload;
        }
        if (state.selectedChild?.id === action.payload.id) {
          state.selectedChild = action.payload;
        }
      })
      // Delete child
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.children = state.children.filter(c => c.id !== action.payload);
        if (state.selectedChild?.id === action.payload) {
          state.selectedChild = null;
        }
      })
      // Search children
      .addCase(searchChildren.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  }
});

export const { selectChild, clearSelectedChild, clearSearchResults } = childrenSlice.actions;

// Selectors
export const selectAllChildren = (state) => state.children.children;
export const selectSelectedChild = (state) => state.children.selectedChild;
export const selectChildrenLoading = (state) => state.children.loading;
export const selectChildrenError = (state) => state.children.error;
export const selectSearchResults = (state) => state.children.searchResults;

export default childrenSlice.reducer;
