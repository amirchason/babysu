import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { children } from '../../api/index'; // Using backend API

export const fetchChildren = createAsyncThunk(
  'children/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // ALWAYS use real API (even in guest mode)
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
      // ALWAYS use real API (even in guest mode)
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
      // ALWAYS use real API (even in guest mode)
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
      // ALWAYS use real API (even in guest mode)
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
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch children
    builder
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add child
    builder
      .addCase(addChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChild.fulfilled, (state, action) => {
        state.loading = false;
        const child = action.payload.data || action.payload;
        state.list.push(child);
      })
      .addCase(addChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update child
    builder
      .addCase(updateChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        state.loading = false;
        const child = action.payload.data || action.payload;
        const index = state.list.findIndex(c => c.id === child.id);
        if (index !== -1) {
          state.list[index] = child;
        }
      })
      .addCase(updateChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete child
    builder
      .addCase(deleteChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(c => c.id !== action.payload);
      })
      .addCase(deleteChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = childrenSlice.actions;
export default childrenSlice.reducer;
