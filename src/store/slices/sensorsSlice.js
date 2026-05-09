import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sensorService } from '../../services/sensorService';

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 20, pages: 0 },
  isLoading: false,
  error: null,
};

export const fetchSensors = createAsyncThunk('sensors/fetchSensors', async (params = {}, { rejectWithValue }) => {
  try {
    return await sensorService.getSensors(params);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load sensors');
  }
});

export const createSensor = createAsyncThunk('sensors/createSensor', async (payload, { rejectWithValue }) => {
  try {
    return await sensorService.createSensor(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create sensor');
  }
});

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    sensorRealtimeUpdated: (state, action) => {
      const payload = action.payload || {};
      const sensor = state.items.find((item) => item.id === payload.sensorId);
      if (sensor) {
        sensor.lastReading = payload.value;
        sensor.lastReadingAt = payload.timestamp;
        if (payload.status) sensor.status = payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSensors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data || [];
        state.meta = action.payload.meta || initialState.meta;
      })
      .addCase(fetchSensors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createSensor.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.meta.total += 1;
      });
  },
});

export const { sensorRealtimeUpdated } = sensorsSlice.actions;
export const selectSensors = (state) => state.sensors.items;
export const selectSensorsLoading = (state) => state.sensors.isLoading;
export const selectSensorsError = (state) => state.sensors.error;
export default sensorsSlice.reducer;
