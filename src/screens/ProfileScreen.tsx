import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
} from 'react-native';
import {MapPin, Bell, LogOut, ChevronRight, Shield} from 'lucide-react-native';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {logoutThunk} from '../store/authSlice';
import {useTheme} from '../context/ThemeContext';
import {StyledCard, Divider} from '../components/ui';

type LocationPermissionLevel = 'always' | 'while_using' | 'denied' | 'never_asked' | 'checking';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const {isDark} = useTheme();
  const [locationStatus, setLocationStatus] = useState<LocationPermissionLevel>('checking');
  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'checking'>('checking');

  const iconColor = isDark ? '#f5f5f5' : '#171717';
  const mutedColor = isDark ? '#a3a3a3' : '#737373';

  const checkPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      const fineGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (!fineGranted) {
        setLocationStatus('denied');
      } else {
        const bgGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        );
        setLocationStatus(bgGranted ? 'always' : 'while_using');
      }

      // Notification permission (Android 13+)
      if (Number(Platform.Version) >= 33) {
        const notifGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        setNotifStatus(notifGranted ? 'granted' : 'denied');
      } else {
        setNotifStatus('granted'); // Not needed pre-Android 13
      }
    } else {
      setLocationStatus('never_asked');
      setNotifStatus('granted');
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') {
      Linking.openSettings();
      return;
    }

    // Step 1: Request fine location first
    const fineGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (!fineGranted) {
      const fineResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permiso de ubicación',
          message: 'La app necesita acceso a tu ubicación para mostrar rutas y rastreo de entregas.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Denegar',
        },
      );
      if (fineResult !== PermissionsAndroid.RESULTS.GRANTED) {
        setLocationStatus('denied');
        return;
      }
      setLocationStatus('while_using');
    }

    // Step 2: Request background location ("Allow all the time")
    // On Android 10+ (API 29+), this must be requested separately after fine location
    if (Number(Platform.Version) >= 29) {
      const bgResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Ubicación en segundo plano',
          message:
            'Para rastrear entregas en ruta, la app necesita acceder a tu ubicación todo el tiempo, incluso en segundo plano.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Denegar',
        },
      );
      if (bgResult === PermissionsAndroid.RESULTS.GRANTED) {
        setLocationStatus('always');
      } else if (bgResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permiso requerido',
          'Para habilitar la ubicación en segundo plano, ve a Ajustes > Permisos > Ubicación y selecciona "Permitir todo el tiempo".',
          [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Abrir Ajustes', onPress: () => Linking.openSettings()},
          ],
        );
      } else {
        setLocationStatus('while_using');
      }
    } else {
      // Pre-Android 10: fine location grant covers background too
      setLocationStatus('always');
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Permiso de notificaciones',
          message: 'La app necesita enviar notificaciones para el rastreo de ubicación en segundo plano.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Denegar',
        },
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        setNotifStatus('granted');
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permiso requerido',
          'Para habilitar notificaciones, ve a Ajustes > Notificaciones y activa el permiso.',
          [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Abrir Ajustes', onPress: () => Linking.openSettings()},
          ],
        );
      } else {
        setNotifStatus('denied');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Salir', style: 'destructive', onPress: () => dispatch(logoutThunk())},
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const statusLabel =
    locationStatus === 'always'
      ? 'Permitido siempre'
      : locationStatus === 'while_using'
        ? 'Solo en uso'
        : locationStatus === 'denied'
          ? 'Denegado'
          : locationStatus === 'checking'
            ? 'Verificando...'
            : 'No solicitado';

  const statusColor =
    locationStatus === 'always'
      ? '#16a34a'
      : locationStatus === 'while_using'
        ? '#d97706'
        : '#dc2626';

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-black p-4">
      {/* User Info */}
      <StyledCard className="mb-4 items-center">
        <View className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-3">
          <Text className="text-white text-2xl font-bold">{initials}</Text>
        </View>
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {user?.name ?? 'Usuario'}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {user?.email ?? ''}
        </Text>
        {user?.roles && user.roles.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3 justify-center">
            {user.roles.map(r => (
              <View
                key={r.name}
                className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                <Text className="text-blue-700 dark:text-blue-300 text-xs font-medium">
                  {r.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </StyledCard>

      {/* Permissions */}
      <StyledCard className="mb-4">
        <View className="flex-row items-center mb-3">
          <Shield size={18} color={iconColor} />
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100 ml-2">
            Permisos
          </Text>
        </View>
        <Divider />
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center flex-1">
            <MapPin size={20} color={mutedColor} />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Ubicación
              </Text>
              <Text style={{color: statusColor}} className="text-xs mt-0.5">
                {statusLabel}
              </Text>
            </View>
          </View>
          {locationStatus !== 'always' && locationStatus !== 'checking' && (
            <TouchableOpacity
              onPress={requestLocationPermission}
              activeOpacity={0.7}
              className="flex-row items-center border border-neutral-300 dark:border-neutral-600 rounded-xl px-3 py-2">
              <Text className="text-xs text-neutral-700 dark:text-neutral-300 mr-1">
                {locationStatus === 'while_using' ? 'Permitir siempre' : 'Solicitar'}
              </Text>
              <ChevronRight size={14} color={mutedColor} />
            </TouchableOpacity>
          )}
        </View>
        {/* Notification permission row */}
        {Platform.OS === 'android' && Number(Platform.Version) >= 33 && (
          <>
            <Divider />
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Bell size={20} color={mutedColor} />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Notificaciones
                  </Text>
                  <Text
                    style={{color: notifStatus === 'granted' ? '#16a34a' : '#dc2626'}}
                    className="text-xs mt-0.5">
                    {notifStatus === 'granted'
                      ? 'Permitido'
                      : notifStatus === 'denied'
                        ? 'Denegado'
                        : 'Verificando...'}
                  </Text>
                </View>
              </View>
              {notifStatus === 'denied' && (
                <TouchableOpacity
                  onPress={requestNotificationPermission}
                  activeOpacity={0.7}
                  className="flex-row items-center border border-neutral-300 dark:border-neutral-600 rounded-xl px-3 py-2">
                  <Text className="text-xs text-neutral-700 dark:text-neutral-300 mr-1">
                    Solicitar
                  </Text>
                  <ChevronRight size={14} color={mutedColor} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </StyledCard>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        activeOpacity={0.7}
        className="mt-4 mb-8 flex-row items-center justify-center border border-neutral-300 dark:border-neutral-600 rounded-xl py-3.5 px-6">
        <LogOut size={18} color="#dc2626" />
        <Text className="text-red-600 font-medium ml-2">Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
