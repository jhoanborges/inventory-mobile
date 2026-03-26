import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  InteractionManager,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Package, Trash2} from 'lucide-react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {TouchableOpacity as GHTouchableOpacity} from 'react-native-gesture-handler';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../../context/ThemeContext';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  addScannedItem,
  incrementQuantity,
  setQuantity,
  updateScannedItem,
  failScannedItem,
  removeScannedItem,
  clearScannedItems,
  type ScannedItem,
} from '../../store/bulkScanSlice';
import {scanBarcode} from '../../services/api';

const IMAGE_SIZE = 48;
const CAROUSEL_WIDTH = Dimensions.get('window').width - 32 - 16; // padding + margin

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

function MiniCarousel({images}: {images: string[]}) {
  const [active, setActive] = useState(0);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActive(Math.round(e.nativeEvent.contentOffset.x / IMAGE_SIZE));
  };

  if (images.length === 1) {
    return (
      <Image
        source={{uri: images[0]}}
        style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10}}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{width: IMAGE_SIZE, height: IMAGE_SIZE}}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        renderItem={({item}) => (
          <Image
            source={{uri: item}}
            style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10}}
            resizeMode="cover"
          />
        )}
      />
      {images.length > 1 && (
        <View style={{position: 'absolute', bottom: 2, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 2}}>
          {images.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === active ? 8 : 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function DeleteAction({onPress}: {onPress: () => void}) {
  return (
    <GHTouchableOpacity
      onPress={onPress}
      style={styles.deleteAction}
      activeOpacity={0.6}>
      <Trash2 size={20} color="#fff" />
      <Text style={{color: '#fff', fontSize: 10, marginTop: 2}}>Borrar</Text>
    </GHTouchableOpacity>
  );
}

function ScannedItemRow({item, onDelete, onQuantityChange}: {item: ScannedItem; onDelete: () => void; onQuantityChange: (qty: number) => void}) {
  const {isDark} = useTheme();
  const highlightBg = useSharedValue(0);

  React.useEffect(() => {
    if (item.highlightCount > 0) {
      highlightBg.value = 1;
      highlightBg.value = withTiming(0, {duration: 1200, easing: Easing.out(Easing.ease)});
    }
  }, [item.highlightCount, highlightBg]);

  const highlightStyle = useAnimatedStyle(() => {
    const alpha = highlightBg.value > 0.01 ? highlightBg.value * 0.4 : 0;
    return {
      backgroundColor: alpha > 0
        ? `rgba(250, 204, 21, ${Math.round(alpha * 100) / 100})`
        : 'transparent',
    };
  });

  const renderRightActions = () => <DeleteAction onPress={onDelete} />;

  const quantityBadge = (
    <View style={styles.quantityContainer}>
      <TextInput
        style={[
          styles.quantityInput,
          {
            color: isDark ? '#f5f5f5' : '#171717',
            borderColor: isDark ? '#404040' : '#e5e5e5',
            backgroundColor: isDark ? '#262626' : '#f5f5f5',
          },
        ]}
        value={String(item.quantity ?? 1)}
        onChangeText={text => {
          const num = parseInt(text, 10);
          if (!isNaN(num) && num > 0) {
            onQuantityChange(num);
          }
        }}
        keyboardType="numeric"
        selectTextOnFocus
        maxLength={4}
        placeholder=""
      />
    </View>
  );

  const content = item.loading ? (
    <View className="flex-row items-center p-3 rounded-xl bg-white dark:bg-neutral-900">
      <SkeletonPulse style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10}} />
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {item.barcode}
        </Text>
        <SkeletonPulse style={{width: '50%', height: 12, marginTop: 4}} />
      </View>
      {quantityBadge}
    </View>
  ) : (
    <View className="flex-row items-center p-3 rounded-xl bg-white dark:bg-neutral-900">
      {item.imagenes && item.imagenes.length > 0 ? (
        <MiniCarousel images={item.imagenes} />
      ) : (
        <View style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 10}} className="bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
          <Package size={20} color={isDark ? '#737373' : '#a3a3a3'} />
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={1}>
          {item.barcode}
        </Text>
        {item.nombre && (
          <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
            {item.nombre}
          </Text>
        )}
      </View>
      {quantityBadge}
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.duration(300)} className="mb-2 rounded-xl overflow-hidden">
      <Animated.View style={[{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, zIndex: 1}, highlightStyle]} pointerEvents="none" />
      <ReanimatedSwipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        rightThreshold={40}>
        {content}
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

export default function EscaneoStep() {
  const items = useAppSelector(s => s.bulkScan.items);
  const dispatch = useAppDispatch();
  const [logs, setLogs] = useState<string[]>([]);
  const [inputKey, setInputKey] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const {isDark} = useTheme();

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 50));
  };

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        inputRef.current?.clear();
        inputRef.current?.focus();
      });
      const interval = setInterval(() => {
        inputRef.current?.focus();
      }, 500);
      return () => {
        task.cancel();
        clearInterval(interval);
      };
    }, []),
  );

  const handleBarcode = (value: string) => {
    value = value.trim();
    console.log('[BulkScan] handleBarcode:', value);
    if (!value) {
      return;
    }

    if (items.some(i => i.barcode === value)) {
      addLog(`+1: ${value}`);
      dispatch(incrementQuantity(value));
      return;
    }

    addLog(`Scanned: ${value}`);

    const id = `${value}_${Date.now()}`;
    dispatch(addScannedItem({
      id,
      barcode: value,
      timestamp: new Date().toLocaleTimeString(),
    }));

    // Fetch product data after 1 second
    setTimeout(() => {
      scanBarcode(value)
        .then(res => {
          const p = res.data.data;
          addLog(`OK: ${p.nombre}`);
          dispatch(updateScannedItem({
            id,
            nombre: p.nombre,
            imagenes: p.imagenes ?? [],
          }));
        })
        .catch((err: any) => {
          addLog(`ERR: ${value} → ${err?.response?.status ?? err?.message}`);
          dispatch(failScannedItem(id));
        });
    }, 1000);
  };

  const clearAll = () => {
    dispatch(clearScannedItems());
    inputRef.current?.focus();
  };

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-black">
      <TextInput
        key={inputKey}
        ref={inputRef}
        style={styles.hiddenInput}
        showSoftInputOnFocus={false}
        blurOnSubmit={false}
        caretHidden
        autoCorrect={false}
        autoCapitalize="none"
        onSubmitEditing={e => {
          const text = e.nativeEvent.text.trim();
          console.log('[BulkScan] onSubmitEditing:', text);
          handleBarcode(text);
          setInputKey(k => k + 1);
        }}
      />

      {/* Header */}
      <View className="bg-white dark:bg-neutral-900 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Package size={20} color={isDark ? '#a3a3a3' : '#737373'} />
            <Text className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              Escanéa productos con el lector
            </Text>
          </View>
          {items.length > 0 && (
            <TouchableOpacity
              onPress={clearAll}
              className="flex-row items-center gap-1"
              activeOpacity={0.7}>
              <Trash2 size={14} color={isDark ? '#ef4444' : '#dc2626'} />
              <Text className="text-xs text-red-600 dark:text-red-400">Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
        {items.length > 0 && (
          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {items.length} escaneado{items.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* List */}
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
          renderItem={({item}) => (
            <ScannedItemRow
              item={item}
              onDelete={() => dispatch(removeScannedItem(item.id))}
              onQuantityChange={qty => dispatch(setQuantity({barcode: item.barcode, quantity: qty}))}
            />
          )}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Debug log
      {logs.length > 0 && (
        <View className="bg-neutral-900 dark:bg-neutral-950 border-t border-neutral-700" style={{maxHeight: 150}}>
          <View className="flex-row items-center justify-between px-3 py-1.5 border-b border-neutral-700">
            <Text className="text-xs font-bold text-green-400">Console</Text>
            <TouchableOpacity onPress={() => setLogs([])} activeOpacity={0.7}>
              <Text className="text-xs text-neutral-500">Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="px-3 py-1">
            {logs.map((log, i) => (
              <Text key={i} className="text-xs text-neutral-300">
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  quantityContainer: {
    marginLeft: 8,
    flexShrink: 0,
  },
  quantityInput: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    width: 52,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    padding: 0,
  },
  deleteAction: {
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    height: '100%',
    borderRadius: 12,
    marginLeft: 8,
  },
});
