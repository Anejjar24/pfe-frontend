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

export const fetchAnalyticsSensors = createAsyncThunk(
  'analytics/fetchSensors',
  async () => {
    const res = await sensorService.getSensors({ limit: 100 });
    return res.data || res || [];
  },
);

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

export const fetchKpis = createAsyncThunk(
  'analytics/fetchKpis',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await analyticsService.getKpis(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load KPIs');
    }
  },
);

export const fetchSystemMetrics = createAsyncThunk(
  'analytics/fetchSystemMetrics',
  async (hours = 24, { rejectWithValue }) => {
    try {
      return await analyticsService.getSystemMetrics(hours);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load system metrics');
    }
  },
);

export const fetchPipelineStats = createAsyncThunk(
  'analytics/fetchPipelineStats',
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getPipelineStats();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load pipeline stats');
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    overview: null,
    overviewLoading: false,
    overviewError: null,

    sensors: [],

    sensorStats: null,
    statsLoading: false,
    statsError: null,

    kpis: null,
    kpisLoading: false,
    kpisError: null,

    systemMetrics: null,
    systemMetricsLoading: false,

    pipelineStats: null,
    pipelineStatsLoading: false,
  },
  reducers: {
    clearSensorStats(state) {
      state.sensorStats = null;
      state.statsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsOverview.pending,   (state) => { state.overviewLoading = true;  state.overviewError = null; })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => { state.overviewLoading = false; state.overview = action.payload; })
      .addCase(fetchAnalyticsOverview.rejected,  (state, action) => { state.overviewLoading = false; state.overviewError = action.payload || action.error.message; })

      .addCase(fetchAnalyticsSensors.fulfilled, (state, action) => { state.sensors = action.payload; })

      .addCase(fetchSensorStats.pending,   (state) => { state.statsLoading = true;  state.statsError = null; state.sensorStats = null; })
      .addCase(fetchSensorStats.fulfilled, (state, action) => { state.statsLoading = false; state.sensorStats = action.payload; })
      .addCase(fetchSensorStats.rejected,  (state, action) => { state.statsLoading = false; state.statsError = action.payload || action.error.message; })

      .addCase(fetchKpis.pending,   (state) => { state.kpisLoading = true;  state.kpisError = null; })
      .addCase(fetchKpis.fulfilled, (state, action) => { state.kpisLoading = false; state.kpis = action.payload; })
      .addCase(fetchKpis.rejected,  (state, action) => { state.kpisLoading = false; state.kpisError = action.payload || action.error.message; })

      .addCase(fetchSystemMetrics.pending,   (state) => { state.systemMetricsLoading = true; })
      .addCase(fetchSystemMetrics.fulfilled, (state, action) => { state.systemMetricsLoading = false; state.systemMetrics = action.payload; })
      .addCase(fetchSystemMetrics.rejected,  (state) => { state.systemMetricsLoading = false; })

      .addCase(fetchPipelineStats.pending,   (state) => { state.pipelineStatsLoading = true; })
      .addCase(fetchPipelineStats.fulfilled, (state, action) => { state.pipelineStatsLoading = false; state.pipelineStats = action.payload; })
      .addCase(fetchPipelineStats.rejected,  (state) => { state.pipelineStatsLoading = false; });
  },
});

export const { clearSensorStats } = analyticsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAnalyticsOverview        = (state) => state.analytics.overview;
export const selectAnalyticsOverviewLoading = (state) => state.analytics.overviewLoading;
export const selectAnalyticsOverviewError   = (state) => state.analytics.overviewError;
export const selectAnalyticsSensors         = (state) => state.analytics.sensors;
export const selectAnalyticsSensorStats     = (state) => state.analytics.sensorStats;
export const selectAnalyticsStatsLoading    = (state) => state.analytics.statsLoading;
export const selectAnalyticsStatsError      = (state) => state.analytics.statsError;
export const selectAnalyticsKpis            = (state) => state.analytics.kpis;
export const selectAnalyticsKpisLoading     = (state) => state.analytics.kpisLoading;
export const selectAnalyticsSystemMetrics   = (state) => state.analytics.systemMetrics;
export const selectAnalyticsPipelineStats   = (state) => state.analytics.pipelineStats;

export default analyticsSlice.reducer;
