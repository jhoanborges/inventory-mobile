# CLAUDE.md - Mobile

## Project overview

Mobile app for warehouse operators. Enables barcode scanning, inventory movement registration, and distribution route management. Built with React Native (bare workflow, no Expo).

## Tech stack

- React Native 0.84 (bare, no Expo)
- React 19 + TypeScript
- React Navigation (Stack + Bottom Tabs)
- React Native Paper (Material Design UI)
- NativeWind v4 (Tailwind CSS for React Native)
- Redux Toolkit (state management)
- Axios (HTTP client)
- react-native-maps, react-native-camera
- AsyncStorage (local persistence)
- Reanimated v4 (animations)
- Yarn v4 (package manager)

## Development commands

```bash
yarn install          # Install dependencies
yarn android          # Run on Android emulator
yarn ios              # Run on iOS simulator (macOS only)
yarn start            # Start Metro bundler
```

For iOS, install pods first:
```bash
cd ios && pod install && cd ..
```

## Architecture

- **Screens**: `src/screens/` - Login, Home, Scanner, ProductDetail, Movimiento, Rutas, RutaDetail
- **Components**: `src/components/` - ProductCard, MovimientoForm, MapMarker
  - `ui/` - Custom styled components (Badge, Divider, SegmentedButtons, StyledButton, StyledCard, StyledTextInput)
- **Navigation**: `src/navigation/AppNavigator.tsx` - Bottom tabs (Inicio, Escaner, Rutas) with nested stacks
- **State**: `src/store/` - Redux store with slices for auth, productos, movimientos, rutas
- **API**: `src/services/api.ts` - Axios configured for device/emulator networking
- **Theme**: `src/context/ThemeContext.tsx` - Dark/light mode context
- **Types**: `src/types/index.ts` - TypeScript interfaces

## Key patterns

- Bare React Native (no Expo) - native modules linked directly
- Navigation is conditional: shows login or main tabs based on auth state
- API base URL uses `10.0.2.2` for Android emulator (maps to host machine localhost)
- For physical devices, change base URL to machine's local IP
- NativeWind configured via `metro.config.js` for Tailwind CSS support
- Redux slices handle async thunks for API calls
- React Native Paper provides themed Material Design components

## API connection

- Android emulator: `http://10.0.2.2:80/api`
- Physical device: `http://192.168.x.x:80/api` (replace with machine IP)
- Authentication: Bearer token from `/api/auth/login`, stored in AsyncStorage

## Conventions

- Use `yarn` (not npm) for all package operations
- Components use PascalCase filenames
- Screens suffixed with `Screen` (e.g., `HomeScreen.tsx`)
- Spanish for UI text and domain terms, English for code
- Node.js >= 22.11.0 required
- Prefer React Native Paper components for UI consistency
