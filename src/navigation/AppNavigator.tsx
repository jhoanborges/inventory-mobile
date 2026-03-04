import React, {useEffect, useRef} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Home, ScanBarcode, Route, UserCircle} from 'lucide-react-native';
import {useAppSelector} from '../store/hooks';
import {useTheme} from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import MovimientoScreen from '../screens/MovimientoScreen';
import RutasScreen from '../screens/RutasScreen';
import RutaDetailScreen from '../screens/RutaDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{title: 'Inicio'}} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{title: 'Producto'}} />
      <Stack.Screen name="Movimiento" component={MovimientoScreen} options={{title: 'Movimiento'}} />
    </Stack.Navigator>
  );
}

function ScannerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ScannerMain" component={ScannerScreen} options={{title: 'Escaner'}} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{title: 'Producto'}} />
      <Stack.Screen name="Movimiento" component={MovimientoScreen} options={{title: 'Movimiento'}} />
    </Stack.Navigator>
  );
}

function RutasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RutasMain" component={RutasScreen} options={{title: 'Rutas'}} />
      <Stack.Screen name="RutaDetail" component={RutaDetailScreen} options={{title: 'Detalle Ruta'}} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{title: 'Perfil'}} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const {isDark} = useTheme();
  const activeTint = isDark ? '#f5f5f5' : '#171717';
  const inactiveTint = isDark ? '#737373' : '#a3a3a3';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({color, size}) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerStack}
        options={{
          tabBarLabel: 'Escaner',
          tabBarIcon: ({color, size}) => <ScanBarcode size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Rutas"
        component={RutasStack}
        options={{
          tabBarLabel: 'Rutas',
          tabBarIcon: ({color, size}) => <Route size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({color, size}) => <UserCircle size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const token = useAppSelector(s => s.auth.token);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    try {
      const loc = require('../services/locationService');
      if (token) {
        wasAuthenticated.current = true;
        loc.startLocationTracking();
      } else if (wasAuthenticated.current) {
        loc.stopLocationTracking();
      }
    } catch (err) {
      console.warn('[LocationService] Not available, rebuild needed:', err);
    }
  }, [token]);

  return token ? <MainTabs /> : <AuthStack />;
}
