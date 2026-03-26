import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TextInput,
  InteractionManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Search, Camera, X} from 'lucide-react-native';
import {
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import {useFocusEffect} from '@react-navigation/native';
import {scanBarcode} from '../services/api';
import {StyledTextInput, StyledButton} from '../components/ui';
import {useTheme} from '../context/ThemeContext';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {setLastScannedBarcode} from '../store/productosSlice';
import type {StackNavigationProp} from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

export default function ScannerScreen({navigation}: Props) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanned, setScanned] = useState(false);

  const {isDark} = useTheme();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const inputRef = useRef<TextInput>(null);
  const dispatch = useAppDispatch();
  const lastScannedBarcode = useAppSelector(s => s.productos.lastScannedBarcode);

  // Focus input after navigation settles so hardware scanner wedge input lands here
  useFocusEffect(
    useCallback(() => {
      if (!cameraOpen) {
        const task = InteractionManager.runAfterInteractions(() => {
          inputRef.current?.focus();
        });
        return () => task.cancel();
      }
    }, [cameraOpen]),
  );

  const handleScan = async (code?: string) => {
    if (loading) {
      return;
    }
    const value = (code ?? barcode).trim();
    console.log('[Scanner] Barcode scanned:', value);
    if (!value) {
      return;
    }
    if (value === lastScannedBarcode) {
      console.log('[Scanner] Duplicate scan, same as last barcode:', value);
    } else {
      console.log('[Scanner] New barcode detected:', value);
    }
    dispatch(setLastScannedBarcode(value));
    setLoading(true);
    try {
      const res = await scanBarcode(value);
      console.log('[Scanner] API response:', JSON.stringify(res.data));
      navigation.navigate('ProductDetail', {producto: res.data.data});
    } catch (err: any) {
      console.log('[Scanner] API error:', err?.response?.status, err?.response?.data, err?.message);
      Alert.alert('No encontrado', 'Producto no encontrado con ese codigo');
    }
    setLoading(false);
  };

  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'ean-8',
      'code-128',
      'code-39',
      'code-93',
      'upc-a',
      'upc-e',
      'itf',
      'codabar',
    ],
    onCodeScanned: codes => {
      if (scanned || codes.length === 0) {
        return;
      }
      const value = codes[0].value;
      if (!value) {
        return;
      }
      setScanned(true);
      setCameraOpen(false);
      setBarcode(value);
      handleScan(value);
    },
  });

  const openCamera = useCallback(async () => {
    if (!hasPermission) {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de cámara',
            message: 'La app necesita acceso a la cámara para escanear códigos de barras.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Denegar',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para escanear.');
          return;
        }
      } else {
        const result = await requestPermission();
        if (!result) {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para escanear.');
          return;
        }
      }
    }
    setScanned(false);
    setCameraOpen(true);
  }, [hasPermission, requestPermission]);

  // Animated scan line
  const scanLinePos = useSharedValue(0);

  useEffect(() => {
    if (cameraOpen) {
      scanLinePos.value = 0;
      scanLinePos.value = withRepeat(
        withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        -1,
        true,
      );
    }
  }, [cameraOpen, scanLinePos]);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: scanLinePos.value * 240, // moves within the 256px scan area (with padding)
  }));

  if (cameraOpen) {
    if (!device) {
      return (
        <View className="flex-1 bg-black items-center justify-center">
          <Text className="text-white text-lg">Cámara no disponible</Text>
          <TouchableOpacity
            onPress={() => setCameraOpen(false)}
            className="mt-4 bg-white/20 rounded-full p-3">
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={StyleSheet.absoluteFill} className="bg-black">
        <VisionCamera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
        {/* Dark overlay with cutout */}
        <View className="absolute inset-0">
          {/* Top dark area */}
          <View className="flex-1 bg-black/50" />
          {/* Middle row: dark | scan area | dark */}
          <View className="flex-row" style={{height: 256}}>
            <View className="flex-1 bg-black/50" />
            {/* Scan area - transparent */}
            <View className="w-64 border-2 border-white/70 rounded-2xl overflow-hidden">
              {/* Corner accents */}
              <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
              <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
              <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
              {/* Animated scan line */}
              <Animated.View
                style={[styles.scanLine, scanLineStyle]}
              />
            </View>
            <View className="flex-1 bg-black/50" />
          </View>
          {/* Bottom dark area */}
          <View className="flex-1 bg-black/50 items-center pt-6">
            <Text className="text-white text-sm">
              Apunta al código de barras o QR
            </Text>
          </View>
        </View>
        {/* Close button */}
        <TouchableOpacity
          onPress={() => setCameraOpen(false)}
          className="absolute top-12 right-4 bg-black/50 rounded-full p-3">
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black p-6">
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-6">
        Escanear Producto
      </Text>

      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
        Codigo de barras
      </Text>
      <StyledTextInput
        ref={inputRef}
        value={barcode}
        onChangeText={text => {
          console.log('[Scanner] Input changed:', text);
          setBarcode(text);
        }}
        placeholder="Escanéa el codigo"
        leftIcon={<Search size={20} color="#a3a3a3" />}
        rightIcon={
          <TouchableOpacity
            onPress={() => {
              setBarcode('');
              inputRef.current?.focus();
            }}
            disabled={!barcode.trim()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
            style={{padding: 6}}
            activeOpacity={0.7}>
            <X size={18} color={barcode.trim() ? (isDark ? '#e5e5e5' : '#525252') : '#d4d4d4'} />
          </TouchableOpacity>
        }
        onSubmitEditing={e => handleScan(e.nativeEvent.text)}
        showSoftInputOnFocus={false}
      />

      <StyledButton
        onPress={() => handleScan()}
        loading={loading}
        disabled={loading || !barcode.trim()}
        className="mt-2">
        Buscar
      </StyledButton>
    </View>
  );
}

const styles = StyleSheet.create({
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#4ade80',
    borderRadius: 2,
    shadowColor: '#4ade80',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});
