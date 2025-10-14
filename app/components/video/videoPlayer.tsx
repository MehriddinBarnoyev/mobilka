"use client"

import { useMemo } from "react"
import { StyleSheet, View, useWindowDimensions, Text } from "react-native"
import { VdoPlayerView } from "vdocipher-rn-bridge"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { isTablet } from "../../../utils/responsive"

interface VideoPlayerProps {
  embedInfo: {
    otp: string
    playbackInfo: string
  }
  width?: number
  aspectRatio?: number
  height?: number
}

export function VideoPlayer({ embedInfo, width, aspectRatio = 16 / 9, height }: VideoPlayerProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const { top, bottom, left, right } = useSafeAreaInsets()
  const isTabletDevice = isTablet()

  const playerWidth = useMemo(() => {
    if (width) return width

    const availableWidth = windowWidth - left - right

    let maxWidth: number
    if (windowWidth >= 1920) {
      maxWidth = 1400
    } else if (windowWidth >= 1440) {
      maxWidth = 1200
    } else if (windowWidth >= 1024) {
      maxWidth = 900
    } else if (isTabletDevice) {
      maxWidth = Math.min(availableWidth - 40, 800)
    } else {
      maxWidth = availableWidth - 32
    }

    return Math.min(maxWidth, availableWidth - 32)
  }, [width, windowWidth, left, right, isTabletDevice])

  const playerHeight = useMemo(() => {
    if (height) return height

    const calculatedHeight = playerWidth / aspectRatio
    const maxHeight = windowHeight * 0.6

    return Math.min(calculatedHeight, maxHeight)
  }, [height, playerWidth, aspectRatio, windowHeight])

  if (!embedInfo || !embedInfo.otp || !embedInfo.playbackInfo) {
    return (
      <View
        style={[
          styles.wrapper,
          {
            paddingTop: top,
            paddingBottom: bottom,
            width: playerWidth,
            height: playerHeight,
            maxWidth: "100%",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={styles.errorText}>Video not available</Text>
      </View>
    )
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: top,
          paddingBottom: bottom,
          width: playerWidth,
          height: playerHeight,
          maxWidth: "100%",
        },
      ]}
    >
      <VdoPlayerView
        style={{
          width: playerWidth,
          height: playerHeight,
        }}
        embedInfo={embedInfo}
        showNativeControls={true}
        onInitializationSuccess={() => console.log("[VdoCipher] Initialization success")}
        onInitializationFailure={(error: any) => console.log("[VdoCipher] Initialization failure:", error)}
        onLoading={() => console.log("[VdoCipher] Loading")}
        onLoaded={() => console.log("[VdoCipher] Loaded")}
        onLoadError={({ errorDescription }: any) => console.log("[VdoCipher] Load error:", errorDescription)}
        onError={({ errorDescription }: any) => console.log("[VdoCipher] Error:", errorDescription)}
        onTracksChanged={() => console.log("[VdoCipher] Tracks changed")}
        onPlaybackSpeedChanged={(speed: any) => console.log("[VdoCipher] Speed changed to", speed)}
        onEnterFullscreen={() => console.log("[VdoCipher] Enter fullscreen")}
        onExitFullscreen={() => console.log("[VdoCipher] Exit fullscreen")}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
  },
  errorText: {
    color: "#e11d48",
    fontSize: 16,
    textAlign: "center",
  },
})
