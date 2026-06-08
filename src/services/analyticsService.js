import apiClient from './apiClient';

export const analyticsService = {
  async getOverview() {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
  },

  async getSensorStats(sensorId, params = {}) {
    const response = await apiClient.get(`/analytics/sensors/${sensorId}/stats`, { params });
    return response.data;
  },

  async getStationHistory(stationId, params = {}) {
    const response = await apiClient.get(`/analytics/stations/${stationId}/history`, { params });
    return response.data;
  },

  async getKpis(params = {}) {
    const response = await apiClient.get('/analytics/kpis', { params });
    return response.data;
  },

  async getSystemMetrics(hours = 24) {
    const response = await apiClient.get('/analytics/system-metrics', { params: { hours } });
    return response.data;
  },

  async getPipelineStats() {
    const response = await apiClient.get('/analytics/pipeline/stats');
    return response.data;
  },
};

export default analyticsService;
