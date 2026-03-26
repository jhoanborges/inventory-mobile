import {Platform} from 'react-native';

type DeviceData = {
  bateria: number | null;
  modelo: string;
  os: string;
  version_app: string;
};

export async function getDeviceInfo(): Promise<DeviceData> {
  try {
    const DeviceInfo = require('react-native-device-info').default;
    console.log('[DeviceInfo] Module loaded:', !!DeviceInfo);
    console.log('[DeviceInfo] getModel:', typeof DeviceInfo?.getModel);
    const [battery, model, osVersion, appVersion] = await Promise.all([
      DeviceInfo.getBatteryLevel().catch((e: any) => {
        console.warn('[DeviceInfo] getBatteryLevel failed:', e);
        return null;
      }),
      Promise.resolve(DeviceInfo.getModel()),
      Promise.resolve(DeviceInfo.getSystemVersion()),
      Promise.resolve(DeviceInfo.getVersion()),
    ]);
    const result = {
      bateria: battery !== null ? Math.round(battery * 1000) / 10 : null,
      modelo: model,
      os: `${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${osVersion}`,
      version_app: appVersion,
    };
    console.log('[DeviceInfo] Result:', JSON.stringify(result));
    return result;
  } catch (e) {
    console.warn('[DeviceInfo] Failed to load:', e);
    return {
      bateria: null,
      modelo: 'unknown',
      os: Platform.OS,
      version_app: '0.0.0',
    };
  }
}

export async function getCurrentLocation(): Promise<{lat: number; lng: number} | null> {
  try {
    const {PermissionsAndroid} = require('react-native');
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (!granted) {
        return null;
      }
    }

    const {RNLocation} = require('@hyoper/rn-location');
    return new Promise(resolve => {
      let resolved = false;
      const sub = RNLocation.subscribe();
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          sub.unsubscribe();
          console.warn('[getCurrentLocation] Timed out after 15s');
          resolve(null);
        }
      }, 15000);

      sub.onChange((locations: any[]) => {
        if (!resolved && locations.length > 0) {
          resolved = true;
          clearTimeout(timeout);
          sub.unsubscribe();
          resolve({lat: locations[0].latitude, lng: locations[0].longitude});
        }
      });

      sub.onError((error: any) => {
        // Ignore transient provider errors — the subscription keeps retrying
        if (error?.code === 'ERROR_UNKNOWN' && /temporarily unavailable/i.test(error?.message)) {
          return;
        }
        // Fatal error — bail out
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          sub.unsubscribe();
          console.warn('[getCurrentLocation] Fatal error:', error?.code, error?.message);
          resolve(null);
        }
      });
    });
  } catch {
    return null;
  }
}
