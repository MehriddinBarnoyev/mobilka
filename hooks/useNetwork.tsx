"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import NetInfo from "@react-native-community/netinfo"

interface NetworkContextType {
  isConnected: boolean | null
  isOfflineMode: boolean
  setOfflineMode: (mode: boolean) => void
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: null,
  isOfflineMode: false,
  setOfflineMode: () => {},
})

export const NetworkProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected ?? false
      setIsConnected(connected)
      console.log("[v0] Initial network state:", connected ? "online" : "offline")
    })

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false
      setIsConnected(connected)
      console.log("[v0] Network state changed:", connected ? "online" : "offline")

      if (connected && isOfflineMode) {
        setIsOfflineMode(false)
        console.log("[v0] Connection restored, exiting offline mode")
      }
    })

    return () => unsubscribe()
  }, [])

  const setOfflineMode = (mode: boolean) => {
    console.log("[v0] Setting offline mode:", mode)
    setIsOfflineMode(mode)
  }

  return (
    <NetworkContext.Provider value={{ isConnected, isOfflineMode, setOfflineMode }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
