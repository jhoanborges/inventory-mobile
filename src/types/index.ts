export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidad_medida: string;
  precio?: number;
  stock_actual: number;
  stock_minimo: number;
  barcode?: string;
  imagen?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  lotes?: Lote[];
}

export interface Lote {
  id: number;
  producto_id: number;
  numero_lote: string;
  cantidad: number;
  fecha_fabricacion?: string;
  fecha_vencimiento?: string;
  estado: 'activo' | 'vencido' | 'agotado';
  producto?: Producto;
  created_at: string;
  updated_at: string;
}

export interface Ruta {
  id: number;
  nombre: string;
  origen: string;
  destino: string;
  operador_id?: number;
  vehiculo?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  fecha_inicio?: string;
  fecha_fin?: string;
  operador?: User;
  created_at: string;
  updated_at: string;
}

export interface MovimientoInventario {
  id: number;
  producto_id: number;
  lote_id?: number;
  ruta_id?: number;
  user_id: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo?: string;
  producto?: Producto;
  lote?: Lote;
  ruta?: Ruta;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: {name: string}[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}
