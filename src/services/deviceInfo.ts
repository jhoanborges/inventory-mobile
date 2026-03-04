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
    const [battery, model, osVersion, appVersion] = await Promise.all([
      DeviceInfo.getBatteryLevel().catch(() => null),
      Promise.resolve(DeviceInfo.getModel()),
      Promise.resolve(DeviceInfo.getSystemVersion()),
      Promise.resolve(DeviceInfo.getVersion()),
    ]);
    return {
      bateria: battery !== null ? Math.round(battery * 1000) / 10 : null,
      modelo: model,
      os: `${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${osVersion}`,
      version_app: appVersion,
    };
  } catch {
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
      const sub = RNLocation.subscribe();
      const timeout = setTimeout(() => {
        sub.unsubscribe();
        resolve(null);
      }, 15000);

      sub.onChange((locations: any[]) => {
        if (locations.length > 0) {
          clearTimeout(timeout);
          sub.unsubscribe();
          resolve({lat: locations[0].latitude, lng: locations[0].longitude});
        }
      });

      sub.onError(() => {
        clearTimeout(timeout);
        sub.unsubscribe();
        resolve(null);
      });
    });
  } catch {
    return null;
  }
}
