import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native';
import {CircleCheck, CircleX, RefreshCw} from 'lucide-react-native';
import {useTheme} from '../../context/ThemeContext';
import {useAppSelector} from '../../store/hooks';
import {verifyStock, type VerifyStockItem} from '../../services/api';

export default function VerificacionStep() {
  const {isDark} = useTheme();
  const items = useAppSelector(s => s.bulkScan.items);
  const [results, setResults] = useState<VerifyStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = async () => {
    if (items.length === 0) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = items.map(i => ({barcode: i.barcode, quantity: i.quantity ?? 1}));
      const res = await verifyStock(payload);
      setResults(res.data.items);
    } catch (err: any) {
      console.log('[Verificacion] Error:', err?.response?.status, err?.message);
      setError(err?.response?.data?.message ?? 'Error al verificar stock');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-lg font-medium text-neutral-400 dark:text-neutral-600 text-center">
          No hay productos escaneados
        </Text>
        <Text className="text-sm text-neutral-300 dark:text-neutral-700 mt-1 text-center">
          Vuelve al paso anterior para escanear
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? '#f5f5f5' : '#171717'} />
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
          Verificando stock...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <CircleX size={48} color="#dc2626" />
        <Text className="text-base font-medium text-red-600 dark:text-red-400 mt-3 text-center">
          {error}
        </Text>
        <TouchableOpacity
          onPress={fetchVerification}
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

  const availableCount = results.filter(r => r.available).length;

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-black">
      {/* Summary */}
      <View className="px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {availableCount}/{results.length} disponibles
          </Text>
          <TouchableOpacity
            onPress={fetchVerification}
            className="flex-row items-center gap-1"
            activeOpacity={0.7}>
            <RefreshCw size={14} color={isDark ? '#a3a3a3' : '#737373'} />
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results list */}
      <FlatList
        data={results}
        keyExtractor={item => item.barcode}
        renderItem={({item}) => (
          <View className="flex-row items-center p-3 mb-2 rounded-xl bg-white dark:bg-neutral-900">
            {item.available ? (
              <CircleCheck size={28} color="#22c55e" />
            ) : (
              <CircleX size={28} color="#dc2626" />
            )}
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
                {item.barcode}
              </Text>
              {item.producto && (
                <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
                  {item.producto}
                </Text>
              )}
              <Text className={`text-xs mt-0.5 ${item.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {item.available
                  ? `Stock: ${item.stock_actual} · Solicitado: ${item.quantity}`
                  : item.stock_actual === 0
                    ? 'Sin stock'
                    : `Stock insuficiente: ${item.stock_actual} disponible, ${item.quantity} solicitado`}
              </Text>
            </View>
            <Text className={`text-lg font-bold ml-2 ${item.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {item.quantity}
            </Text>
          </View>
        )}
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
