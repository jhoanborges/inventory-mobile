import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import type {
  AuthResponse,
  Lote,
  MovimientoInventario,
  PaginatedResponse,
  Producto,
  Ruta,
  User,
} from '../types';

const BASE_URL = Config.API_URL || 'https://inventory-backend-main-wklaj1.laravel.cloud';
console.log('API BASE URL:', BASE_URL);

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
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

type RutaActionPayload = {
  lat?: number;
  lng?: number;
  motivo_pausa?: string;
  dispositivo?: Record<string, unknown>;
};

export const iniciarRuta = (id: number, payload?: RutaActionPayload) =>
  api.post<{message: string; ruta: Ruta}>(`/rutas/${id}/iniciar`, payload);

export const pausarRuta = (id: number, payload?: RutaActionPayload) =>
  api.post<{message: string; ruta: Ruta}>(`/rutas/${id}/pausar`, payload);

export const finalizarRuta = (id: number, payload?: RutaActionPayload) =>
  api.post<{message: string; ruta: Ruta}>(`/rutas/${id}/finalizar`, payload);

// Ubicaciones (location tracking)
export const registrarUbicacion = (data: {
  lat: number;
  lng: number;
  altitud?: number | null;
  precision?: number | null;
  velocidad?: number | null;
  rumbo?: number | null;
  registrado_at?: string;
  dispositivo?: Record<string, unknown>;
}) => api.post('/ubicacion', data);

export const getUbicaciones = (params?: {
  user_id?: number;
  desde?: string;
  hasta?: string;
  per_page?: number;
}) => api.get('/ubicaciones', {params});

// Movimientos
export const getMovimientos = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<MovimientoInventario>>('/movimientos', {params});

export const createMovimiento = (data: Partial<MovimientoInventario>) =>
  api.post<{data: MovimientoInventario}>('/movimientos', data);

// Scan
export const scanBarcode = (barcode: string) =>
  api.get<{data: Producto}>(`/scan/${barcode}`);

export default api;
