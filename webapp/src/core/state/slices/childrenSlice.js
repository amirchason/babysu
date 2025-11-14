import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { children } from '../../api/index'; // Using backend API

// LocalStorage fallback helpers
const CHILDREN_STORAGE_KEY = 'babysu_children';

const getLocalChildren = () => {
  try {
    const stored = localStorage.getItem(CHILDREN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalChildren = (childrenList) => {
  try {
    localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(childrenList));
  } catch (err) {
    console.error('Failed to save children to localStorage:', err);
  }
};

export const fetchChildren = createAsyncThunk(
  'children/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Try API first
      const response = await children.getAll();
      return { source: 'api', data: response };
    } catch (error) {
      // Fallback to localStorage if API fails
      console.log('API unavailable, using localStorage for children');
      const localChildren = getLocalChildren();
      return { source: 'local', data: localChildren };
    }
  }
);

export const addChild = createAsyncThunk(
  'children/add',
  async (childData, { rejectWithValue, getState }) => {
    try {
      // Try API first
      const response = await children.create(childData);
      return { source: 'api', data: response };
    } catch (error) {
      // Fallback to localStorage if API fails
      console.log('API unavailable, saving child to localStorage');
      const newChild = {
        id: `local_${Date.now()}`,
        ...childData,
        createdAt: new Date().toISOString(),
      };
      const currentChildren = getLocalChildren();
      const updatedChildren = [...currentChildren, newChild];
      saveLocalChildren(updatedChildren);
      return { source: 'local', data: newChild };
    }
  }
);

export const updateChild = createAsyncThunk(
  'children/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Try API first
      const response = await children.update(id, data);
      return { source: 'api', data: response };
    } catch (error) {
      // Fallback to localStorage if API fails
      console.log('API unavailable, updating child in localStorage');
      const currentChildren = getLocalChildren();
      const updatedChildren = currentChildren.map(child =>
        child.id === id ? { ...child, ...data } : child
      );
      saveLocalChildren(updatedChildren);
      const updatedChild = updatedChildren.find(c => c.id === id);
      return { source: 'local', data: updatedChild };
    }
  }
);

export const deleteChild = createAsyncThunk(
  'children/delete',
  async (id, { rejectWithValue }) => {
    try {
      // Try API first
      await children.delete(id);
      return { source: 'api', id };
    } catch (error) {
      // Fallback to localStorage if API fails
      console.log('API unavailable, deleting child from localStorage');
      const currentChildren = getLocalChildren();
      const updatedChildren = currentChildren.filter(child => child.id !== id);
      saveLocalChildren(updatedChildren);
      return { source: 'local', id };
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
        state.list = action.payload.data;
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
        const child = action.payload.data;
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
        const child = action.payload.data;
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
        state.list = state.list.filter(c => c.id !== action.payload.id);
      })
      .addCase(deleteChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = childrenSlice.actions;
export default childrenSlice.reducer;
