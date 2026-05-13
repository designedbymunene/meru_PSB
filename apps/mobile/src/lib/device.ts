import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const getDeviceInfo = async () => {
    return {
        deviceId: Device.osBuildId || 'unknown',
        deviceName: Device.deviceName || `${Device.manufacturer} ${Device.modelName}` || 'Unknown Device',
        os: `${Device.osName} ${Device.osVersion}` || Platform.OS,
    };
};
