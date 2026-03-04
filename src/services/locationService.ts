import {Platform, PermissionsAndroid} from 'react-native';
import {RNLocation} from '@hyoper/rn-location';
import {registrarUbicacion} from './api';

const INTERVAL_MS = 60 * 1000; // 1 minute

let intervalId: ReturnType<typeof setInterval> | null = null;
let lastLocation: {lat: number; lng: number; altitud: number | null; precision: number | null; velocidad: number | null; rumbo: number | null} | null = null;
let subscription: ReturnType<typeof RNLocation.subscribe> | null = null;

async function sendPing() {
  if (!lastLocation) {
    console.warn('[LocationService] No location available yet');
    return;
  }
  try {
    await registrarUbicacion({
      ...lastLocation,
      registrado_at: new Date().toISOString(),
    });
    console.log('[LocationService] Ping sent:', lastLocation.lat, lastLocation.lng);
  } catch (err) {
    console.warn('[LocationService] Error sending ping:', err);
  }
}

export async function startLocationTracking(): Promise<void> {
  if (subscription) {
    return;
  }

  // Android 13+ requires runtime notification permission for foreground services
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('[LocationService] Notification permission denied, background tracking may not work');
    }
  }

  RNLocation.configure({
    allowsBackgroundLocationUpdates: true,
    notificationMandatory: true,
  });

  subscription = RNLocation.subscribe();

  subscription.onChange(locations => {
    if (locations.length > 0) {
      const loc = locations[0];
      lastLocation = {
        lat: loc.latitude,
        lng: loc.longitude,
        altitud: loc.altitude ?? null,
        precision: loc.accuracy ?? null,
        velocidad: loc.speed ?? null,
        rumbo: loc.course ?? null,
      };
    }
  });

  subscription.onError(error => {
    // Transient provider errors are normal on emulators / cold starts — suppress noise
    if (error.code === 'ERROR_UNKNOWN' && /temporarily unavailable/i.test(error.message)) {
      return;
    }
    console.warn('[LocationService] Error:', error.code, error.message);
  });

  // Send first ping after a short delay to allow GPS fix
  setTimeout(sendPing, 5000);
  // Then every minute
  intervalId = setInterval(sendPing, INTERVAL_MS);
  console.log('[LocationService] Tracking started');
}

export function stopLocationTracking(): void {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  lastLocation = null;
  console.log('[LocationService] Tracking stopped');
}
