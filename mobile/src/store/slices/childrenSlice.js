import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { children } from '../../services/api';

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
        state.list = action.payload;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add child
    builder
      .addCase(addChild.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });

    // Update child
    builder
      .addCase(updateChild.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });

    // Delete child
    builder
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearError } = childrenSlice.actions;
export default childrenSlice.reducer;
