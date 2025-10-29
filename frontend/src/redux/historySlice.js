import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchHistory = createAsyncThunk(
  'history/fetchHistory',
  async () => {
    const res = await axios.get('/api/history', { withCredentials: true });
    return res.data;
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: [],
    status: 'idle',
  },
  reducers: {
    clearHistory: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHistory.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { clearHistory } = historySlice.actions;
export default historySlice.reducer;
