import React, {useEffect, useState} from 'react';
import {View, ScrollView, Text} from 'react-native';
import {Sun, Moon, Package, AlertTriangle, Truck, ArrowLeftRight} from 'lucide-react-native';
import {useAppDispatch} from '../store/hooks';
import {logoutThunk} from '../store/authSlice';
import {getProductos, getRutas, getMovimientos} from '../services/api';
import {useTheme} from '../context/ThemeContext';
import {StyledCard, StyledButton} from '../components/ui';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
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

      <View className="mt-6">
        <StyledButton
          variant="outlined"
          onPress={() => dispatch(logoutThunk())}>
          Cerrar Sesion
        </StyledButton>
      </View>
    </ScrollView>
  );
}
