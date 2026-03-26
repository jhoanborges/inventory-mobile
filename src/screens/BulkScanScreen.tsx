import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  InteractionManager,
  Image,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Package, X, Trash2} from 'lucide-react-native';
import {useFocusEffect} from '@react-navigation/native';
import {scanBarcode} from '../services/api';
import {StyledTextInput} from '../components/ui';
import {useTheme} from '../context/ThemeContext';
import type {Producto} from '../types';

type ScannedItem = {
  id: string;
  barcode: string;
  loading: boolean;
  error: boolean;
  producto: Producto | null;
};

function SkeletonPulse({style}: {style?: object}) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {duration: 800, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({opacity: opacity.value}));

  return (
    <Animated.View
      style={[{backgroundColor: '#a3a3a3', borderRadius: 8}, style, animStyle]}
    />
  );
}

function ScannedItemRow({item}: {item: ScannedItem}) {
  const {isDark} = useTheme();

  if (item.loading) {
    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        className="flex-row items-center p-3 mb-2 rounded-xl bg-white dark:bg-neutral-900">
        <SkeletonPulse style={{width: 48, height: 48, borderRadius: 10}} />
        <View className="flex-1 ml-3">
          <SkeletonPulse style={{width: '70%', height: 14, marginBottom: 6}} />
          <SkeletonPulse style={{width: '40%', height: 12}} />
        </View>
      </Animated.View>
    );
  }

  if (item.error) {
    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        className="flex-row items-center p-3 mb-2 rounded-xl bg-red-50 dark:bg-red-950/30">
        <View className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 items-center justify-center">
          <X size={20} color={isDark ? '#fca5a5' : '#dc2626'} />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-sm font-medium text-red-600 dark:text-red-400">
            No encontrado
          </Text>
          <Text className="text-xs text-red-400 dark:text-red-500">
            {item.barcode}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const producto = item.producto!;
  const firstImage = producto.imagenes?.[0];

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="flex-row items-center p-3 mb-2 rounded-xl bg-white dark:bg-neutral-900">
      {firstImage ? (
        <Image
          source={{uri: firstImage}}
          className="w-12 h-12 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
          <Package size={20} color={isDark ? '#737373' : '#a3a3a3'} />
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
          {producto.nombre}
        </Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          {producto.sku} · Stock: {producto.stock_actual}
        </Text>
      </View>
      <Text className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
        {item.barcode}
      </Text>
    </Animated.View>
  );
}

export default function BulkScanScreen() {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef<TextInput>(null);
  const {isDark} = useTheme();

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        inputRef.current?.focus();
      });
      return () => task.cancel();
    }, []),
  );

  const handleScan = (code?: string) => {
    const value = (code ?? barcode).trim();
    if (!value) {
      return;
    }

    const id = `${value}_${Date.now()}`;
    const newItem: ScannedItem = {
      id,
      barcode: value,
      loading: true,
      error: false,
      producto: null,
    };

    setItems(prev => [newItem, ...prev]);
    setBarcode('');
    inputRef.current?.focus();

    // Fetch async
    scanBarcode(value)
      .then(res => {
        setItems(prev =>
          prev.map(i =>
            i.id === id ? {...i, loading: false, producto: res.data.data} : i,
          ),
        );
      })
      .catch(() => {
        setItems(prev =>
          prev.map(i =>
            i.id === id ? {...i, loading: false, error: true} : i,
          ),
        );
      });
  };

  const clearAll = () => {
    setItems([]);
    inputRef.current?.focus();
  };

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-black">
      {/* Header input area */}
      <View className="bg-white dark:bg-neutral-900 px-4 pt-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <StyledTextInput
              ref={inputRef}
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Escanéa productos..."
              leftIcon={<Package size={20} color="#a3a3a3" />}
              rightIcon={
                barcode.trim() ? (
                  <TouchableOpacity
                    onPress={() => {
                      setBarcode('');
                      inputRef.current?.focus();
                    }}
                    hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                    style={{padding: 6}}
                    activeOpacity={0.7}>
                    <X size={18} color={isDark ? '#e5e5e5' : '#525252'} />
                  </TouchableOpacity>
                ) : undefined
              }
              onSubmitEditing={e => handleScan(e.nativeEvent.text)}
              showSoftInputOnFocus={false}
            />
          </View>
        </View>
        {items.length > 0 && (
          <View className="flex-row items-center justify-between pb-2">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {items.length} producto{items.length !== 1 ? 's' : ''} escaneado{items.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              onPress={clearAll}
              className="flex-row items-center gap-1"
              activeOpacity={0.7}>
              <Trash2 size={14} color={isDark ? '#ef4444' : '#dc2626'} />
              <Text className="text-xs text-red-600 dark:text-red-400">Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Scanned items list */}
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Package size={64} color={isDark ? '#404040' : '#d4d4d4'} />
          <Text className="text-lg font-medium text-neutral-400 dark:text-neutral-600 mt-4 text-center">
            Escanéa productos con el lector
          </Text>
          <Text className="text-sm text-neutral-300 dark:text-neutral-700 mt-1 text-center">
            Los productos apareceran aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ScannedItemRow item={item} />}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
