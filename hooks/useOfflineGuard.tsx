"use client"

import { useEffect } from "react"
import { Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useNetwork } from "./useNetwork"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../type"

/**
 * Custom hook that shows an alert when the user is offline
 * and navigates them to MyDownloads after they press OK
 */
export const useOfflineGuard = (screenName: string) => {
  const { isConnected } = useNetwork()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    if (!isConnected) {
      console.log(`[v0] ${screenName}: User is offline, showing alert`)

      Alert.alert(
        "Offline Mode",
        "You are now offline. To see all details, please turn on your network or connect to Wi-Fi. Currently, you can only view downloaded videos.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log(`[v0] ${screenName}: Navigating to MyDownloads`)
              navigation.navigate("MyDownloads")
            },
          },
        ],
        { cancelable: false },
      )
    }
  }, [isConnected, navigation, screenName])

  return { isConnected }
}
