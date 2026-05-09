import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import realtimeReducer from './slices/realtimeSlice';
import stationsReducer from './slices/stationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    realtime: realtimeReducer,
    stations: stationsReducer,
  },
});

export default store;
