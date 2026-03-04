import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import * as api from '../services/api';
import type {Ruta} from '../types';

interface RutasState {
  items: Ruta[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: RutasState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchRutas = createAsyncThunk(
  'rutas/fetch',
  async (params?: Record<string, string | number>) => {
    const {data} = await api.getRutas(params);
    return data;
  },
);

const rutasSlice = createSlice({
  name: 'rutas',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRutas.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRutas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.meta.total;
      })
      .addCase(fetchRutas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error';
      });
  },
});

export default rutasSlice.reducer;
