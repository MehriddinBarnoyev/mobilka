import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import auth from '../../utils/auth';
import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { resetToLogin } from '../navigationService';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: 'https://assoodiq.devops.uz/',
  timeout: 10000,
});

api.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    if (!config.skipAuth) {
      const token = await auth.getToken();
      if (token && config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  async (response: AxiosResponse) => {
    try {
      const activeDevices = response.headers['x-active-devices'];
      if (activeDevices) {
        const deviceId = await DeviceInfo.getUniqueId();
        const devicesArray = typeof activeDevices === 'string'
          ? activeDevices.split(',').map(d => d.trim())
            : [];
        if (!devicesArray.includes(deviceId)) {
            console.log('No devices found');
                }
            }
        } catch (err) {
            console.error("Device check error:", err);
        }
        return response;
    },
    async (error) => {
        console.error("API Error:", error.response?.data || error.message);

        if (error.response?.status === 401) {
            const currentToken = await auth.getToken();
            if (currentToken) {
                Alert.alert("Unauthorized", "Please log in again.");
                await auth.removeToken();
                resetToLogin();
            }
        }

        return Promise.reject(error);
    }
);


export default api;
