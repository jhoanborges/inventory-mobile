import React, {useEffect, useState} from 'react';
import {View, ScrollView, Text, Alert} from 'react-native';
import {Sun, Moon, Package, AlertTriangle, Truck, ArrowLeftRight, MapPin} from 'lucide-react-native';
import {getProductos, getRutas, getMovimientos, registrarUbicacion} from '../services/api';
import {getDeviceInfo, getCurrentLocation} from '../services/deviceInfo';
import {useTheme} from '../context/ThemeContext';
import {StyledCard, StyledButton} from '../components/ui';

export default function HomeScreen() {
  const {toggleTheme, isDark} = useTheme();
  const [stats, setStats] = useState({
    totalProductos: 0,
    stockBajo: 0,
    rutasActivas: 0,
    movimientos: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, rutaRes, movRes] = await Promise.all([
          getProductos({per_page: 1000}),
          getRutas({estado: 'en_progreso'}),
          getMovimientos({per_page: 1000}),
        ]);
        const productos = prodRes.data.data;
        setStats({
          totalProductos: prodRes.data.meta.total,
          stockBajo: productos.filter(p => p.stock_actual <= p.stock_minimo).length,
          rutasActivas: rutaRes.data.meta.total,
          movimientos: movRes.data.meta.total,
        });
      } catch {}
    };
    load();
  }, []);

  const [sendingLocation, setSendingLocation] = useState(false);

  const handleSendLocation = async () => {
    setSendingLocation(true);
    try {
      console.log('[HomeScreen] Getting location...');
      const location = await getCurrentLocation();
      console.log('[HomeScreen] Location result:', JSON.stringify(location));
      if (!location) {
        Alert.alert('Error', 'No se pudo obtener la ubicación');
        return;
      }
      console.log('[HomeScreen] Getting device info...');
      const device = await getDeviceInfo();
      console.log('[HomeScreen] Device info:', JSON.stringify(device));
      console.log('[HomeScreen] Sending to API...');
      await registrarUbicacion({
        ...location,
        registrado_at: new Date().toISOString(),
        dispositivo: device,
      });
      Alert.alert('Enviado', `Ubicación enviada: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    } catch (e: any) {
      console.warn('[HomeScreen] Error:', e);
      Alert.alert('Error', e.response?.data?.message || 'No se pudo enviar la ubicación');
    } finally {
      setSendingLocation(false);
    }
  };

  const iconColor = isDark ? '#f5f5f5' : '#171717';

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-black p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Dashboard
        </Text>
        <StyledButton
          variant="outlined"
          onPress={toggleTheme}
          className="px-3 py-2">
          {isDark ? 'Claro' : 'Oscuro'}
        </StyledButton>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <StyledCard className="w-[47%] mb-2">
          <View className="flex-row items-center mb-2">
            <Package size={18} color={iconColor} />
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
              Total Productos
            </Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.totalProductos}
          </Text>
        </StyledCard>

        <StyledCard className="w-[47%] mb-2">
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={18} color="#dc2626" />
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
              Stock Bajo
            </Text>
          </View>
          <Text className="text-2xl font-bold text-danger">
            {stats.stockBajo}
          </Text>
        </StyledCard>

        <StyledCard className="w-[47%] mb-2">
          <View className="flex-row items-center mb-2">
            <Truck size={18} color="#16a34a" />
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
              Rutas Activas
            </Text>
          </View>
          <Text className="text-2xl font-bold text-success">
            {stats.rutasActivas}
          </Text>
        </StyledCard>

        <StyledCard className="w-[47%] mb-2">
          <View className="flex-row items-center mb-2">
            <ArrowLeftRight size={18} color={iconColor} />
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
              Movimientos
            </Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.movimientos}
          </Text>
        </StyledCard>
      </View>

      <StyledButton
        onPress={handleSendLocation}
        disabled={sendingLocation}
        className="mt-4 mb-8">
        <View className="flex-row items-center justify-center">
          <MapPin size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">
            {sendingLocation ? 'Enviando...' : 'Enviar Ubicación'}
          </Text>
        </View>
      </StyledButton>

    </ScrollView>
  );
}
