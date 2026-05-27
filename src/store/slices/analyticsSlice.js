import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/analyticsService';
import { sensorService } from '../../services/sensorService';

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchAnalyticsOverview = createAsyncThunk(
  'analytics/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getOverview();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load overview');
    }
  },
);

/** Loads the full sensor list for the analysis dropdown (max 100). */
export const fetchAnalyticsSensors = createAsyncThunk(
  'analytics/fetchSensors',
  async () => {
    const res = await sensorService.getSensors({ limit: 100 });
    return res.data || res || [];
  },
);

/**
 * Fetch aggregated stats for one sensor over a time range.
 * @param {{ sensorId: string, params: { from?: string, to?: string } }} arg
 */
export const fetchSensorStats = createAsyncThunk(
  'analytics/fetchSensorStats',
  async ({ sensorId, params }, { rejectWithValue }) => {
    try {
      return await analyticsService.getSensorStats(sensorId, params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load sensor stats');
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    // Overview KPI data
    overview: null,
    overviewLoading: false,
    overviewError: null,

    // Sensor dropdown list
    sensors: [],

    // Per-sensor time-series stats
    sensorStats: null,
    statsLoading: false,
    statsError: null,
  },
  reducers: {
    /** Clear sensor stats when the user de-selects a sensor. */
    clearSensorStats(state) {
      state.sensorStats = null;
      state.statsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Overview ────────────────────────────────────────────────────────────
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.overviewLoading = true;
        state.overviewError = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.overviewError = action.payload || action.error.message || 'Unknown error';
      })

      // ── Sensor list ─────────────────────────────────────────────────────────
      .addCase(fetchAnalyticsSensors.fulfilled, (state, action) => {
        state.sensors = action.payload;
      })

      // ── Sensor stats ────────────────────────────────────────────────────────
      .addCase(fetchSensorStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
        state.sensorStats = null;
      })
      .addCase(fetchSensorStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.sensorStats = action.payload;
      })
      .addCase(fetchSensorStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload || action.error.message || 'Unknown error';
      });
  },
});

export const { clearSensorStats } = analyticsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAnalyticsOverview = (state) => state.analytics.overview;
export const selectAnalyticsOverviewLoading = (state) => state.analytics.overviewLoading;
export const selectAnalyticsOverviewError = (state) => state.analytics.overviewError;
export const selectAnalyticsSensors = (state) => state.analytics.sensors;
export const selectAnalyticsSensorStats = (state) => state.analytics.sensorStats;
export const selectAnalyticsStatsLoading = (state) => state.analytics.statsLoading;
export const selectAnalyticsStatsError = (state) => state.analytics.statsError;

export default analyticsSlice.reducer;
