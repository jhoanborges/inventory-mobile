import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Route, MapPin, RefreshCw, CircleCheck} from 'lucide-react-native';
import {useTheme} from '../../context/ThemeContext';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {selectRuta} from '../../store/bulkScanSlice';
import {getRutas} from '../../services/api';
import type {Ruta} from '../../types';

export default function RutaStep() {
  const {isDark} = useTheme();
  const dispatch = useAppDispatch();
  const selectedRutaId = useAppSelector(s => s.bulkScan.selectedRutaId);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRutas({per_page: 50});
      setRutas(res.data.data);
    } catch (err: any) {
      console.log('[RutaStep] Error:', err?.response?.status, err?.message);
      setError(err?.response?.data?.message ?? 'Error al cargar rutas');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? '#f5f5f5' : '#171717'} />
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
          Cargando rutas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Route size={48} color="#dc2626" />
        <Text className="text-base font-medium text-red-600 dark:text-red-400 mt-3 text-center">
          {error}
        </Text>
        <TouchableOpacity
          onPress={fetchRutas}
          className="mt-4 flex-row items-center gap-2 bg-neutral-900 dark:bg-neutral-100 rounded-xl px-5 py-3"
          activeOpacity={0.7}>
          <RefreshCw size={16} color={isDark ? '#171717' : '#f5f5f5'} />
          <Text className="text-sm font-semibold text-white dark:text-neutral-900">
            Reintentar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (rutas.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Route size={64} color={isDark ? '#404040' : '#d4d4d4'} />
        <Text className="text-lg font-medium text-neutral-400 dark:text-neutral-600 mt-4 text-center">
          No hay rutas disponibles
        </Text>
      </View>
    );
  }

  const estadoColor = (estado: Ruta['estado']) => {
    switch (estado) {
      case 'pendiente': return isDark ? '#facc15' : '#ca8a04';
      case 'en_progreso': return isDark ? '#60a5fa' : '#2563eb';
      case 'pausada': return isDark ? '#fb923c' : '#ea580c';
      case 'completada': return isDark ? '#4ade80' : '#16a34a';
      default: return isDark ? '#a3a3a3' : '#737373';
    }
  };

  const estadoLabel = (estado: Ruta['estado']) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_progreso': return 'En progreso';
      case 'pausada': return 'Pausada';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-black">
      <View className="px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          Selecciona una ruta para el movimiento
        </Text>
      </View>

      <FlatList
        data={rutas}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => {
          const isSelected = selectedRutaId === item.id;
          return (
            <TouchableOpacity
              onPress={() => dispatch(selectRuta(isSelected ? null : item.id))}
              activeOpacity={0.7}
              className={`p-4 mb-2 rounded-xl ${isSelected ? 'border-2' : ''}`}
              style={{
                backgroundColor: isDark ? '#171717' : '#ffffff',
                borderColor: isSelected ? (isDark ? '#f5f5f5' : '#171717') : 'transparent',
              }}>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                      {item.nombre}
                    </Text>
                    {isSelected && <CircleCheck size={16} color="#22c55e" />}
                  </View>
                  {item.vehiculo && (
                    <Text className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {item.vehiculo}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-1 mt-1">
                    <MapPin size={12} color={isDark ? '#737373' : '#a3a3a3'} />
                    <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
                      {item.origen} → {item.destino}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{color: estadoColor(item.estado)}}
                  className="text-xs font-medium ml-2">
                  {estadoLabel(item.estado)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
