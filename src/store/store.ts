import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productosReducer from './productosSlice';
import movimientosReducer from './movimientosSlice';
import rutasReducer from './rutasSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    productos: productosReducer,
    movimientos: movimientosReducer,
    rutas: rutasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
