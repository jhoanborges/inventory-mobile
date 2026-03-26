import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  CircleCheckBig,
  CircleX,
  RefreshCw,
  Package,
  Route,
  ChevronDown,
  ChevronUp,
  PenLine,
  Check,
} from 'lucide-react-native';
import {useTheme} from '../../context/ThemeContext';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {clearScannedItems, setFirma} from '../../store/bulkScanSlice';
import {createOperacion, type OperacionMovimiento} from '../../services/api';

export default function ResultadoStep() {
  const {isDark} = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const items = useAppSelector(s => s.bulkScan.items);
  const selectedRutaId = useAppSelector(s => s.bulkScan.selectedRutaId);
  const firma = useAppSelector(s => s.bulkScan.firma);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [movimientos, setMovimientos] = useState<OperacionMovimiento[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const operationLabel = selectedRutaId
    ? `Ruta #${selectedRutaId}`
    : `${items.length} producto${items.length !== 1 ? 's' : ''}`;

  const handleSubmit = async () => {
    if (items.length === 0 || !firma) {
      return;
    }
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setSuccess(false);
    try {
      const payload = {
        ruta_id: selectedRutaId,
        tipo: 'salida' as const,
        items: items.map(i => ({barcode: i.barcode, quantity: i.quantity ?? 1})),
        firma,
      };
      console.log('[Resultado] Sending:', JSON.stringify(payload));
      const res = await createOperacion(payload);
      console.log('[Resultado] Response:', JSON.stringify(res.data));
      setSuccess(true);
      setSuccessMessage(res.data.message);
      setMovimientos(res.data.movimientos ?? []);
    } catch (err: any) {
      console.log('[Resultado] Error:', err?.response?.status, err?.response?.data, err?.message);
      const data = err?.response?.data;
      setError(data?.message ?? err?.message ?? 'Error al registrar operacion');
      if (data?.errors) {
        setErrorDetails(JSON.stringify(data.errors, null, 2));
      } else if (data && typeof data === 'object') {
        setErrorDetails(JSON.stringify(data, null, 2));
      }
    }
    setLoading(false);
  };

  if (items.length === 0 && !success) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Package size={64} color={isDark ? '#404040' : '#d4d4d4'} />
        <Text className="text-lg font-medium text-neutral-400 dark:text-neutral-600 mt-4 text-center">
          No hay productos escaneados
        </Text>
      </View>
    );
  }

  if (success) {
    return (
      <View className="flex-1 bg-neutral-100 dark:bg-black">
        <View className="items-center pt-12 px-8">
          <CircleCheckBig size={72} color="#22c55e" />
          <Text className="text-xl font-bold text-green-600 dark:text-green-400 mt-4 text-center">
            {successMessage || 'Operacion registrada'}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center">
            {movimientos.length} movimiento{movimientos.length !== 1 ? 's' : ''} registrado{movimientos.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {movimientos.length > 0 && (
          <FlatList
            data={movimientos}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => (
              <View className="flex-row items-center p-3 mb-2 rounded-xl bg-white dark:bg-neutral-900">
                <CircleCheckBig size={20} color="#22c55e" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.barcode}
                  </Text>
                  <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                    Cantidad: {item.cantidad} · {item.tipo}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={{padding: 16}}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View className="px-4 pb-4">
          <TouchableOpacity
            onPress={() => {
              dispatch(clearScannedItems());
              setSuccess(false);
              setMovimientos([]);
            }}
            className="bg-neutral-900 dark:bg-neutral-100 rounded-xl py-3 items-center"
            activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-white dark:text-neutral-900">
              Nueva operacion
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{padding: 16}}>
        {/* Summary */}
        <View className="rounded-xl bg-white dark:bg-neutral-900 p-4 mb-4">
          <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Resumen de operacion
          </Text>

          <View className="flex-row items-center mb-2">
            <Package size={16} color={isDark ? '#a3a3a3' : '#737373'} />
            <Text className="text-sm text-neutral-700 dark:text-neutral-300 ml-2">
              {items.length} producto{items.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-neutral-700 dark:text-neutral-300 ml-6">
              {items.reduce((sum, i) => sum + (i.quantity ?? 1), 0)} unidades totales
            </Text>
          </View>

          <View className="flex-row items-center">
            <Route size={16} color={isDark ? '#a3a3a3' : '#737373'} />
            <Text className="text-sm text-neutral-700 dark:text-neutral-300 ml-2">
              {selectedRutaId ? `Ruta #${selectedRutaId}` : 'Sin ruta asignada'}
            </Text>
          </View>
        </View>

        {/* Items preview */}
        <View className="rounded-xl bg-white dark:bg-neutral-900 p-4 mb-4">
          <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Productos
          </Text>
          {items.map(item => (
            <View key={item.id} className="flex-row items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
              <Text className="flex-1 text-sm text-neutral-700 dark:text-neutral-300" numberOfLines={1}>
                {item.nombre ?? item.barcode}
              </Text>
              <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-100 ml-2">
                x{item.quantity ?? 1}
              </Text>
            </View>
          ))}
        </View>

        {/* Signature button */}
        <View className="rounded-xl bg-white dark:bg-neutral-900 p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <PenLine size={16} color={isDark ? '#a3a3a3' : '#737373'} />
            <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 ml-2">
              Firma del operador
            </Text>
            <Text className="text-xs text-red-500 ml-1">*</Text>
          </View>

          {firma ? (
            <>
              <View className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 mb-3" style={{height: 120}}>
                <Image
                  source={{uri: firma}}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="contain"
                />
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => dispatch(setFirma(null))}
                  className="flex-1 rounded-lg py-2 items-center border border-neutral-300 dark:border-neutral-700"
                  activeOpacity={0.7}>
                  <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Eliminar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Firma', {label: operationLabel})}
                  className="flex-1 rounded-lg py-2 items-center border border-neutral-300 dark:border-neutral-700"
                  activeOpacity={0.7}>
                  <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Cambiar firma
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Firma', {label: operationLabel})}
              className="flex-row items-center justify-center gap-2 rounded-xl py-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600"
              activeOpacity={0.7}>
              <PenLine size={20} color={isDark ? '#a3a3a3' : '#737373'} />
              <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Toque para firmar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Error box */}
        {error && (
          <View className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 mb-4">
            <View className="flex-row items-center">
              <CircleX size={20} color="#dc2626" />
              <Text className="text-sm font-medium text-red-600 dark:text-red-400 ml-2 flex-1">
                {error}
              </Text>
            </View>
            {errorDetails && (
              <>
                <TouchableOpacity
                  onPress={() => setShowDetails(!showDetails)}
                  className="flex-row items-center mt-2"
                  activeOpacity={0.7}>
                  {showDetails ? (
                    <ChevronUp size={14} color="#dc2626" />
                  ) : (
                    <ChevronDown size={14} color="#dc2626" />
                  )}
                  <Text className="text-xs text-red-500 dark:text-red-400 ml-1">
                    {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                  </Text>
                </TouchableOpacity>
                {showDetails && (
                  <View className="mt-2 p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <Text className="text-xs text-red-700 dark:text-red-300 font-mono">
                      {errorDetails}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View className="px-4 pb-4 pt-2 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        {error && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="flex-row items-center justify-center gap-2 bg-red-600 rounded-xl py-3 mb-2"
            activeOpacity={0.7}>
            <RefreshCw size={16} color="#fff" />
            <Text className="text-sm font-semibold text-white">Reintentar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !firma}
          className={`rounded-xl py-3 items-center ${
            !firma
              ? 'bg-neutral-300 dark:bg-neutral-700'
              : 'bg-neutral-900 dark:bg-neutral-100'
          }`}
          activeOpacity={0.7}>
          {loading ? (
            <ActivityIndicator size="small" color={isDark ? '#171717' : '#f5f5f5'} />
          ) : (
            <Text
              className={`text-sm font-semibold ${
                !firma
                  ? 'text-neutral-500 dark:text-neutral-400'
                  : 'text-white dark:text-neutral-900'
              }`}>
              {firma ? 'Confirmar operacion' : 'Firma requerida'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
