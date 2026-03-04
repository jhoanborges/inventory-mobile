import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import * as api from '../services/api';
import type {Producto} from '../types';

interface ProductosState {
  items: Producto[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductosState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchProductos = createAsyncThunk(
  'productos/fetch',
  async (params?: Record<string, string | number>) => {
    const {data} = await api.getProductos(params);
    return data;
  },
);

const productosSlice = createSlice({
  name: 'productos',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProductos.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.meta.total;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error al cargar productos';
      });
  },
});

export default productosSlice.reducer;
