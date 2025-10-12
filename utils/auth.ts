import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../type';

const TOKEN_KEY = 'auth_token';

const auth = {
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token set successfully:', token);
    } catch (e) {
      console.error('❌ Error setting token:', e);
    }
  },
  // 

  getToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      // console.log('🔑 Retrieved token:', token);
      return token;
    } catch (e) {
      console.error('❌ Error getting token:', e);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Token removed successfully');
    } catch (e) {
      console.error('❌ Error removing token:', e);
    }
  },

  isLoggedIn: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const loggedIn = !!token;
      console.log('👤 isLoggedIn:', loggedIn);
      return loggedIn;
    } catch (e) {
      console.error('❌ Error checking login status:', e);
      return false;
    }
  },

    setUserId: async (userId: number | string) => {
        try {
            await AsyncStorage.setItem("USER_ID_KEY", String(userId));
            console.log('✅ UserId set successfully:', userId);
        } catch (e) {
            console.error('❌ Error setting userId:', e);
        }
    },

    getUserId: async (): Promise<string | null> => {
        try {
            const userId = await AsyncStorage.getItem("USER_ID_KEY");
            return userId;
        } catch (e) {
            console.error('❌ Error getting userId:', e);
            return null;
        }
    },

    removeUserId: async () => {
        try {
            await AsyncStorage.removeItem("USER_ID_KEY");
            console.log('🗑️ UserId removed successfully');
        } catch (e) {
            console.error('❌ Error removing userId:', e);
        }
    },
};

export default auth;
