import React, {useRef, useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Config from 'react-native-config';
import {
  Navigation,
  Play,
  Pause,
  Square,
  MapPin,
  ChevronRight,
  Clock,
  Route,
} from 'lucide-react-native';
import {StyledCard, Divider} from '../components/ui';
import {iniciarRuta, pausarRuta, finalizarRuta} from '../services/api';
import {getDeviceInfo, getCurrentLocation} from '../services/deviceInfo';
import type {Ruta} from '../types';
import type {RouteProp} from '@react-navigation/native';

const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY || '';

type Props = {
  route: RouteProp<{params: {ruta: Ruta}}, 'params'>;
};

export default function RutaDetailScreen({route}: Props) {
  const initialRuta = route.params?.ruta;
  const [ruta, setRuta] = useState(initialRuta);
  const [actionLoading, setActionLoading] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState<{distance: number; duration: number} | null>(null);
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [pauseMotivo, setPauseMotivo] = useState('');
  const mapRef = useRef<MapView>(null);

  if (!ruta) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-100 dark:bg-black">
        <Text className="text-neutral-500">No se encontró la ruta</Text>
      </View>
    );
  }

  const oLat = Number(ruta.origen_lat);
  const oLng = Number(ruta.origen_lng);
  const dLat = Number(ruta.destino_lat);
  const dLng = Number(ruta.destino_lng);
  const hasCoords =
    isFinite(oLat) && isFinite(oLng) && isFinite(dLat) && isFinite(dLng);

  const originCoord = hasCoords ? {latitude: oLat, longitude: oLng} : null;
  const destinoCoord = hasCoords ? {latitude: dLat, longitude: dLng} : null;

  const isPlaying = ruta.estado === 'en_progreso';
  const isPaused = ruta.estado === 'pausada';
  const isPending = ruta.estado === 'pendiente';
  const isCompleted = ruta.estado === 'completada';
  const canPlay = isPending || isPaused;
  const canStop = isPlaying;

  const buildPayload = async (extra?: Record<string, unknown>) => {
    const [location, dispositivo] = await Promise.all([
      getCurrentLocation(),
      getDeviceInfo(),
    ]);
    return {
      ...location,
      dispositivo,
      ...extra,
    };
  };

  const handlePlay = async () => {
    setActionLoading(true);
    try {
      const payload = await buildPayload();
      const {data} = await iniciarRuta(ruta.id, payload);
      setRuta(data.ruta);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'No se pudo iniciar');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = () => {
    setPauseMotivo('');
    setPauseModalVisible(true);
  };

  const confirmPause = async () => {
    if (!pauseMotivo.trim()) {
      Alert.alert('Error', 'Debes ingresar un motivo para pausar la ruta');
      return;
    }
    setPauseModalVisible(false);
    setActionLoading(true);
    try {
      const payload = await buildPayload({motivo_pausa: pauseMotivo.trim()});
      const {data} = await pausarRuta(ruta.id, payload);
      setRuta(data.ruta);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'No se pudo pausar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = () => {
    Alert.alert('Finalizar Ruta', '¿Estás seguro de finalizar esta ruta?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Finalizar',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            const payload = await buildPayload();
            const {data} = await finalizarRuta(ruta.id, payload);
            setRuta(data.ruta);
          } catch (e: any) {
            Alert.alert(
              'Error',
              e.response?.data?.message || 'No se pudo finalizar',
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const openNavigation = () => {
    // Use coordinates for navigation if available, fallback to address strings
    const dest = hasCoords
      ? `${ruta.destino_lat},${ruta.destino_lng}`
      : encodeURIComponent(ruta.destino_direccion || ruta.destino);
    const orig = hasCoords
      ? `${ruta.origen_lat},${ruta.origen_lng}`
      : encodeURIComponent(ruta.origen_direccion || ruta.origen);

    const url = Platform.select({
      android: `google.navigation:q=${dest}&mode=d`,
      ios: `comgooglemaps://?saddr=${orig}&daddr=${dest}&directionsmode=driving`,
    })!;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=driving`,
      );
    });
  };

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-black p-4">
      <StyledCard className="mb-4">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {ruta.nombre}
        </Text>

        <Divider />

        <View className="flex-row items-start mb-1">
          <MapPin size={14} color="#22c55e" className="mt-0.5 mr-1" />
          <View className="flex-1 ml-1">
            <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {ruta.origen}
            </Text>
            {ruta.origen_direccion && (
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                {ruta.origen_direccion}
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row items-start mt-2">
          <MapPin size={14} color="#ef4444" className="mt-0.5 mr-1" />
          <View className="flex-1 ml-1">
            <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {ruta.destino}
            </Text>
            {ruta.destino_direccion && (
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                {ruta.destino_direccion}
              </Text>
            )}
          </View>
        </View>

        <Divider />

        <Text className="text-sm text-neutral-700 dark:text-neutral-300">
          Estado: {String(ruta.estado)}
        </Text>
        {ruta.vehiculo && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            Vehiculo: {ruta.vehiculo}
          </Text>
        )}
        {ruta.operador && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            Operador: {ruta.operador.name}
          </Text>
        )}

        <Divider />

        {ruta.fecha_inicio && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300">
            Inicio: {ruta.fecha_inicio}
          </Text>
        )}
        {ruta.fecha_fin && (
          <Text className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
            Fin: {ruta.fecha_fin}
          </Text>
        )}
      </StyledCard>

      {!isCompleted && (
        <View className="flex-row items-center justify-center gap-4 mb-4">
          {isPlaying ? (
            <TouchableOpacity
              onPress={handlePause}
              disabled={actionLoading}
              className="bg-yellow-500 rounded-full p-4">
              <Pause size={28} color="#fff" fill="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handlePlay}
              disabled={actionLoading || !canPlay}
              className={`rounded-full p-4 ${canPlay ? 'bg-green-600' : 'bg-neutral-400'}`}>
              <Play size={28} color="#fff" fill="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleStop}
            disabled={actionLoading || !canStop}
            className={`rounded-full p-4 ${canStop ? 'bg-red-600' : 'bg-neutral-400'}`}>
            <Square size={28} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {GOOGLE_MAPS_API_KEY && hasCoords && !mapError ? (
        <View className="mb-4 rounded-xl overflow-hidden" style={{height: 300}}>
          <MapView
            ref={mapRef}
            style={{flex: 1}}
            key={`${oLat}-${oLng}-${dLat}-${dLng}`}
            region={{
              latitude: (oLat + dLat) / 2,
              longitude: (oLng + dLng) / 2,
              latitudeDelta: Math.abs(oLat - dLat) * 1.5 || 0.5,
              longitudeDelta: Math.abs(oLng - dLng) * 1.5 || 0.5,
            }}>
            <Marker
              coordinate={originCoord!}
              title={ruta.origen}
              description={ruta.origen_direccion}
              pinColor="green"
            />
            <Marker
              coordinate={destinoCoord!}
              title={ruta.destino}
              description={ruta.destino_direccion}
              pinColor="red"
            />
            <MapViewDirections
              origin={originCoord!}
              destination={destinoCoord!}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor="#2563eb"
              language="es"
              onReady={result => {
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: {top: 60, right: 60, bottom: 60, left: 60},
                  animated: true,
                });
                setRouteInfo({
                  distance: result.distance,
                  duration: result.duration,
                });
                if (result.legs?.length) {
                  setRouteSteps(result.legs[0].steps || []);
                }
              }}
              onError={() => setMapError(true)}
            />
          </MapView>
        </View>
      ) : (
        <View className="mb-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 p-4 items-center">
          <Text className="text-sm text-neutral-500">
            {mapError
              ? 'No se pudo trazar la ruta en el mapa'
              : 'Sin coordenadas para mostrar el mapa'}
          </Text>
        </View>
      )}

      {routeInfo && (
        <View className="flex-row items-center justify-center gap-4 mb-4">
          <View className="flex-row items-center">
            <Route size={16} color="#6b7280" />
            <Text className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
              {routeInfo.distance.toFixed(1)} km
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={16} color="#6b7280" />
            <Text className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
              {Math.round(routeInfo.duration)} min
            </Text>
          </View>
        </View>
      )}

      {routeSteps.length > 0 && (
        <StyledCard className="mb-4">
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            Pasos de la ruta
          </Text>
          {routeSteps.map((step: any, index: number) => (
            <View
              key={index}
              className={`flex-row items-start py-2 ${index < routeSteps.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`}>
              <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center mt-0.5">
                <Text className="text-xs text-white font-bold">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-sm text-neutral-800 dark:text-neutral-200">
                  {step.html_instructions?.replace(/<[^>]*>/g, '') || ''}
                </Text>
                <View className="flex-row mt-1">
                  <Text className="text-xs text-neutral-500">
                    {step.distance?.text}
                  </Text>
                  <Text className="text-xs text-neutral-500 ml-2">
                    {step.duration?.text}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </StyledCard>
      )}

      <TouchableOpacity
        onPress={openNavigation}
        className="bg-green-600 rounded-xl p-4 flex-row items-center justify-center mb-10">
        <Navigation size={20} color="#fff" />
        <Text className="text-white font-semibold text-base ml-2">
          Iniciar Navegacion
        </Text>
      </TouchableOpacity>

      <Modal
        visible={pauseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPauseModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white dark:bg-neutral-800 rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Pausar Ruta
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Ingresa el motivo de la pausa:
            </Text>
            <TextInput
              value={pauseMotivo}
              onChangeText={setPauseMotivo}
              placeholder="Motivo de pausa..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 text-neutral-900 dark:text-neutral-100 mb-4"
              style={{textAlignVertical: 'top', minHeight: 80}}
              autoFocus
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setPauseModalVisible(false)}
                className="px-4 py-2 rounded-lg">
                <Text className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPause}
                className="bg-yellow-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Pausar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
