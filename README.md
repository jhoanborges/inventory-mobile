# Inventario Bodega - Mobile

Aplicación móvil para operadores de bodega. Permite escanear productos, registrar movimientos de inventario y gestionar rutas de distribución.

## Tech Stack

- **React Native 0.84** (bare, sin Expo)
- **React 19** + **TypeScript**
- **React Navigation** (Stack + Bottom Tabs)
- **React Native Paper** (UI Material Design)
- **NativeWind v4** (Tailwind CSS para React Native)
- **Redux Toolkit** (estado global)
- **Axios** (HTTP client)
- **react-native-maps** (mapas)
- **react-native-camera** (escáner)
- **AsyncStorage** (almacenamiento local)
- **Reanimated v4** (animaciones)
- **Lucide React Native** (iconos)
- **Yarn v4** (package manager)

## Requisitos

- Node.js >= 22.11.0
- Yarn
- Android Studio (para Android)
- Xcode (solo macOS, para iOS)
- Backend corriendo (accesible desde el dispositivo/emulador)

## Instalación

```bash
# Instalar dependencias
yarn install

# Android
yarn android

# iOS (solo macOS)
cd ios && pod install && cd ..
yarn ios

# Metro bundler (si no arranca automáticamente)
yarn start
```

## Estructura del proyecto

```
src/
├── screens/
│   ├── LoginScreen.tsx         # Autenticación
│   ├── HomeScreen.tsx          # Dashboard
│   ├── ScannerScreen.tsx       # Escáner de barcode
│   ├── ProductDetailScreen.tsx # Detalle de producto
│   ├── MovimientoScreen.tsx    # Registrar movimiento
│   ├── RutasScreen.tsx         # Lista de rutas
│   └── RutaDetailScreen.tsx    # Detalle de ruta
├── components/
│   ├── ProductCard.tsx         # Tarjeta de producto
│   ├── MovimientoForm.tsx      # Formulario de movimiento
│   ├── MapMarker.tsx           # Marcador en mapa
│   └── ui/                    # Componentes styled (Badge, StyledButton, etc.)
├── navigation/
│   └── AppNavigator.tsx        # Bottom tabs + Stack navigation
├── store/
│   ├── store.ts                # Redux store
│   ├── authSlice.ts            # Estado de autenticación
│   ├── productosSlice.ts       # Estado de productos
│   ├── movimientosSlice.ts     # Estado de movimientos
│   ├── rutasSlice.ts           # Estado de rutas
│   └── hooks.ts                # Custom hooks
├── services/
│   └── api.ts                  # Axios configurado para dispositivo
├── context/
│   └── ThemeContext.tsx         # Dark/light mode
└── types/
    └── index.ts                # Interfaces TypeScript
```

## Configuración de red

El archivo `src/services/api.ts` configura la URL base de la API:

- **Emulador Android**: `http://10.0.2.2:80/api` (mapea al host)
- **Dispositivo físico**: `http://192.168.x.x:80/api` (IP de tu máquina)

## Navegación

- **Tab Inicio** - Dashboard y lista de productos
- **Tab Escáner** - Escaneo de barcode para buscar productos
- **Tab Rutas** - Gestión de rutas de distribución

La navegación condicional muestra login o tabs según el estado de autenticación.

## Funcionalidades

- Login con token Bearer (Sanctum)
- Escáner de barcode para buscar productos
- Ver detalle de productos con stock y lotes
- Registrar movimientos de inventario (entrada/salida)
- Ver y gestionar rutas de distribución
- Soporte dark/light mode
