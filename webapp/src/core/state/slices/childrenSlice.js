import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { children } from '../../api/index';

export const fetchChildren = createAsyncThunk(
  'children/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await children.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addChild = createAsyncThunk(
  'children/add',
  async (childData, { rejectWithValue }) => {
    try {
      const response = await children.create(childData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateChild = createAsyncThunk(
  'children/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await children.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteChild = createAsyncThunk(
  'children/delete',
  async (id, { rejectWithValue }) => {
    try {
      await children.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const childrenSlice = createSlice({
  name: 'children',
  initialState: {
    list: [],
    selectedChild: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch children
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add child
      .addCase(addChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChild.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update child
      .addCase(updateChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.selectedChild?.id === action.payload.id) {
          state.selectedChild = action.payload;
        }
      })
      .addCase(updateChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete child
      .addCase(deleteChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(c => c.id !== action.payload);
        if (state.selectedChild?.id === action.payload) {
          state.selectedChild = null;
        }
      })
      .addCase(deleteChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectChild, clearError } = childrenSlice.actions;
export default childrenSlice.reducer;
