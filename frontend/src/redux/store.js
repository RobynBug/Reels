import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import watchlistReducer from './watchlistSlice';
import historyReducer from './historySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    watchlist: watchlistReducer,
    history: historyReducer,
  },
});
