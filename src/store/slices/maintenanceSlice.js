import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { maintenanceService } from '../../services/maintenanceService';

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 20, pages: 0 },
  isLoading: false,
  error: null,
};

export const fetchMaintenance = createAsyncThunk('maintenance/fetchMaintenance', async (params = {}, { rejectWithValue }) => {
  try {
    return await maintenanceService.getMaintenance(params);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load maintenance');
  }
});

export const createMaintenance = createAsyncThunk('maintenance/createMaintenance', async (payload, { rejectWithValue }) => {
  try {
    return await maintenanceService.createMaintenance(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create maintenance');
  }
});

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data || [];
        state.meta = action.payload.meta || initialState.meta;
      })
      .addCase(fetchMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createMaintenance.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.meta.total += 1;
      });
  },
});

export const selectMaintenanceItems = (state) => state.maintenance.items;
export const selectMaintenanceLoading = (state) => state.maintenance.isLoading;
export const selectMaintenanceError = (state) => state.maintenance.error;
export default maintenanceSlice.reducer;
