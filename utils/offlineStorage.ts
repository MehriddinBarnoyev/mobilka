import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEYS = {
  USER_PIN: "@user_pin",
  USER_TOKEN: "@user_token",
  USER_DATA: "@user_data",
  OFFLINE_MODE: "@offline_mode",
}

export const offlineStorage = {
  // Save user PIN for offline access
  async saveUserPin(pin: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PIN, pin)
    } catch (error) {
      console.error("Error saving user PIN:", error)
    }
  },

  // Get saved user PIN
  async getUserPin(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_PIN)
    } catch (error) {
      console.error("Error getting user PIN:", error)
      return null
    }
  },

  // Save user token for offline access
  async saveUserToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token)
    } catch (error) {
      console.error("Error saving user token:", error)
    }
  },

  // Get saved user token
  async getUserToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN)
    } catch (error) {
      console.error("Error getting user token:", error)
      return null
    }
  },

  // Save user data for offline access
  async saveUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  },

  // Get saved user data
  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Error getting user data:", error)
      return null
    }
  },

  // Set offline mode flag
  async setOfflineMode(isOffline: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(isOffline))
    } catch (error) {
      console.error("Error setting offline mode:", error)
    }
  },

  // Get offline mode flag
  async getOfflineMode(): Promise<boolean> {
    try {
      const mode = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE)
      return mode ? JSON.parse(mode) : false
    } catch (error) {
      console.error("Error getting offline mode:", error)
      return false
    }
  },

  // Clear all offline data (on logout)
  async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PIN,
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.OFFLINE_MODE,
      ])
    } catch (error) {
      console.error("Error clearing offline data:", error)
    }
  },
}
