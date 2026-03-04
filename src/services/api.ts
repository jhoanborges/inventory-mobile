import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthResponse,
  Lote,
  MovimientoInventario,
  PaginatedResponse,
  Producto,
  Ruta,
  User,
} from '../types';

const api = axios.create({
  baseURL: 'http://192.168.100.8:80/api', // Local network IP for physical device
  headers: {'Content-Type': 'application/json', Accept: 'application/json'},
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', {email, password});

export const logout = () => api.post('/auth/logout');

export const getUser = () => api.get<User>('/auth/user');

// Productos
export const getProductos = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<Producto>>('/productos', {params});

export const getProducto = (id: number) =>
  api.get<{data: Producto}>(`/productos/${id}`);

// Lotes
export const getLotes = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<Lote>>('/lotes', {params});

// Rutas
export const getRutas = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<Ruta>>('/rutas', {params});

export const getRuta = (id: number) =>
  api.get<{data: Ruta}>(`/rutas/${id}`);

export const updateRuta = (id: number, data: Partial<Ruta>) =>
  api.put<{data: Ruta}>(`/rutas/${id}`, data);

// Movimientos
export const getMovimientos = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<MovimientoInventario>>('/movimientos', {params});

export const createMovimiento = (data: Partial<MovimientoInventario>) =>
  api.post<{data: MovimientoInventario}>('/movimientos', data);

// Scan
export const scanBarcode = (barcode: string) =>
  api.get<{data: Producto}>(`/scan/${barcode}`);

export default api;
